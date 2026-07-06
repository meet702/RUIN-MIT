package com.RuinMIT.service;

import com.RuinMIT.dto.*;
import com.RuinMIT.entity.EmailVerification;
import com.RuinMIT.entity.RefreshToken;
import com.RuinMIT.entity.User;
import com.RuinMIT.exception.BadRequestException;
import com.RuinMIT.exception.ResourceNotFoundException;
import com.RuinMIT.exception.UnauthorizedException;
import com.RuinMIT.repository.EmailVerificationRepository;
import com.RuinMIT.repository.RefreshTokenRepository;
import com.RuinMIT.repository.UserRepository;
import com.RuinMIT.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int REFRESH_TOKEN_EXPIRY_DAYS = 7;

    // ==================== REGISTER ====================

    @Transactional
    public ApiResponse<Void> register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        // Create user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(com.RuinMIT.entity.UserRole.student)
                .isVerified(false)
                .isActive(true)
                .build();

        userRepository.save(user);

        // Generate and send OTP
        String otp = generateOtp();
        saveOtp(user, otp);
        emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);

        log.info("User registered successfully: {}", user.getEmail());
        return ApiResponse.success("Registration successful. Please check your email for the OTP.");
    }

    // ==================== VERIFY EMAIL ====================

    @Transactional
    public ApiResponse<Void> verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email"));

        if (user.getIsVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        EmailVerification verification = emailVerificationRepository
                .findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request a new one."));

        // Check expiry
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        // Check OTP match
        if (!verification.getToken().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP. Please try again.");
        }

        // Mark OTP as used
        verification.setIsUsed(true);
        emailVerificationRepository.save(verification);

        // Mark user as verified
        user.setIsVerified(true);
        userRepository.save(user);

        log.info("Email verified successfully for: {}", user.getEmail());
        return ApiResponse.success("Email verified successfully. You can now login.");
    }

    // ==================== LOGIN ====================

    @Transactional
    public ApiResponse<AuthResponse> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Check if verified
        if (!user.getIsVerified()) {
            throw new BadRequestException("Please verify your email before logging in");
        }

        // Check if active
        if (!user.getIsActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Contact support.");
        }

        // Generate tokens
        UserDetails userDetails = buildUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = generateAndSaveRefreshToken(user);

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400) // 24 hours in seconds
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .profilePictureUrl(user.getProfilePictureUrl())
                        .build())
                .build();

        log.info("User logged in successfully: {}", user.getEmail());
        return ApiResponse.success("Login successful", authResponse);
    }

    // ==================== REFRESH TOKEN ====================

    @Transactional
    public ApiResponse<AuthResponse> refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (storedToken.getIsRevoked()) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        User user = storedToken.getUser();
        UserDetails userDetails = buildUserDetails(user);
        String newAccessToken = jwtService.generateToken(userDetails);

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(storedToken.getToken()) // return the same refresh token
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .profilePictureUrl(user.getProfilePictureUrl())
                        .build())
                .build();

        log.info("Access token refreshed for: {}", user.getEmail());
        return ApiResponse.success("Token refreshed successfully", authResponse);
    }

    // ==================== LOGOUT ====================

    @Transactional
    public ApiResponse<Void> logout(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        storedToken.setIsRevoked(true);
        refreshTokenRepository.save(storedToken);

        log.info("User logged out, refresh token revoked");
        return ApiResponse.success("Logged out successfully");
    }

    // ==================== RESEND OTP ====================

    @Transactional
    public ApiResponse<Void> resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email"));

        if (user.getIsVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        // Invalidate old OTPs
        emailVerificationRepository.invalidateAllOtpsForUser(user);

        // Generate and send new OTP
        String otp = generateOtp();
        saveOtp(user, otp);
        emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);

        log.info("OTP resent to: {}", user.getEmail());
        return ApiResponse.success("A new OTP has been sent to your email.");
    }

    // ==================== FORGOT PASSWORD ====================

    @Transactional
    public ApiResponse<Void> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email"));

        if (!user.getIsActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Contact support.");
        }

        if (!user.getIsVerified()) {
            throw new BadRequestException("Please verify your email before resetting your password");
        }

        emailVerificationRepository.invalidateAllOtpsForUser(user);

        String otp = generateOtp();
        saveOtp(user, otp);
        emailService.sendPasswordResetOtpEmail(user.getEmail(), user.getFullName(), otp);

        log.info("Password reset OTP sent to: {}", user.getEmail());
        return ApiResponse.success("Password reset OTP has been sent to your email.");
    }

    // ==================== RESET PASSWORD ====================

    @Transactional
    public ApiResponse<Void> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email"));

        if (!user.getIsActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Contact support.");
        }

        EmailVerification verification = emailVerificationRepository
                .findTopByUserAndIsUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request a new one."));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (!verification.getToken().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP. Please try again.");
        }

        verification.setIsUsed(true);
        emailVerificationRepository.save(verification);

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.revokeAllActiveTokensForUser(user);

        log.info("Password reset successfully for: {}", user.getEmail());
        return ApiResponse.success("Password reset successfully. You can now login.");
    }

    // ==================== HELPERS ====================

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // 6-digit OTP
        return String.valueOf(otp);
    }

    private void saveOtp(User user, String otp) {
        EmailVerification verification = EmailVerification.builder()
                .user(user)
                .token(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .isUsed(false)
                .build();
        emailVerificationRepository.save(verification);
    }

    private String generateAndSaveRefreshToken(User user) {
        String token = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_EXPIRY_DAYS))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    private UserDetails buildUserDetails(User user) {
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name().toUpperCase()))
        );
    }
}
