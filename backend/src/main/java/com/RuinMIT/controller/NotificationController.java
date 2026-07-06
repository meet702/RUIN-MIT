package com.RuinMIT.controller;

import com.RuinMIT.dto.ApiResponse;
import com.RuinMIT.dto.notification.NotificationResponse;
import com.RuinMIT.entity.User;
import com.RuinMIT.exception.UnauthorizedException;
import com.RuinMIT.repository.UserRepository;
import com.RuinMIT.security.JwtService;
import com.RuinMIT.service.NotificationService;
import com.RuinMIT.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private static final long SSE_TIMEOUT_MS = 30L * 60L * 1000L;

    private final NotificationService notificationService;
    private final SseEmitterService sseEmitterService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(Authentication authentication) {
        List<NotificationResponse> notifications = notificationService.getUserNotifications(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable UUID id,
            Authentication authentication) {

        NotificationResponse notification = notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", notification));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", Map.of("count", count)));
    }

    @GetMapping("/stream")
    public SseEmitter streamNotifications(@RequestParam String token) {
        String userEmail = jwtService.extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (!jwtService.validateToken(token, userDetails)) {
            throw new UnauthorizedException("Invalid notification stream token");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid notification stream user"));

        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        sseEmitterService.addEmitter(user.getId(), emitter);

        try {
            emitter.send(SseEmitter.event().comment("connected"));
        } catch (Exception ex) {
            sseEmitterService.removeEmitter(user.getId());
            throw new UnauthorizedException("Unable to open notification stream");
        }

        return emitter;
    }
}
