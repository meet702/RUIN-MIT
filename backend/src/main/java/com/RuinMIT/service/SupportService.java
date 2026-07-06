package com.RuinMIT.service;

import com.RuinMIT.entity.User;
import com.RuinMIT.exception.ResourceNotFoundException;
import com.RuinMIT.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupportService {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Value("${app.support.email}")
    private String supportEmail;

    public void sendContactMessage(String category, String message, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String subject = switch (category) {
            case "feedback" -> "[RuinMIT Feedback]";
            case "bug" -> "[RuinMIT Bug Report]";
            default -> "[RuinMIT Help Request]";
        };

        String body = """
                <strong>Category:</strong> %s<br><br>
                <strong>From:</strong> %s (%s)<br><br>
                <strong>Message:</strong><br>
                <p style="white-space:pre-wrap;">%s</p>
                """.formatted(
                        category.substring(0, 1).toUpperCase() + category.substring(1),
                        user.getFullName(),
                        user.getEmail(),
                        message.replace("<", "&lt;").replace(">", "&gt;")
                );

        notificationService.sendEmailNotification(supportEmail, subject, body);

        log.info("Support contact message sent from {} [{}] — category: {}", user.getFullName(), user.getEmail(), category);
    }
}
