package com.RuinMIT.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        sendOtpEmail(toEmail, fullName, otp, "RuinMIT - Verify Your Email", "Email Verification", "Use the following OTP to verify your email address.");
    }

    public void sendPasswordResetOtpEmail(String toEmail, String fullName, String otp) {
        sendOtpEmail(toEmail, fullName, otp, "RuinMIT - Reset Your Password", "Password Reset", "Use the following OTP to reset your password.");
    }

    public void sendNotificationEmail(String toEmail, String subject, String body) {
        try {
            Map<String, Object> payload = new HashMap<>();

            Map<String, String> sender = new HashMap<>();
            sender.put("name", "RuinMIT");
            sender.put("email", "meetchhabhaiya10@gmail.com");
            payload.put("sender", sender);

            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", toEmail);
            payload.put("to", List.of(recipient));

            payload.put("subject", subject);
            payload.put("htmlContent", buildNotificationEmailHtml(subject, body));

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Notification email sent successfully to: {}", toEmail);
            } else {
                log.error("Failed to send notification email. Status: {}, Body: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Error sending notification email to {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendOtpEmail(String toEmail, String fullName, String otp, String subject, String title, String message) {
        try {
            Map<String, Object> payload = new HashMap<>();

            // Sender
            Map<String, String> sender = new HashMap<>();
            sender.put("name", "RuinMIT");
            sender.put("email", "meetchhabhaiya10@gmail.com");
            payload.put("sender", sender);

            // Recipient
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", toEmail);
            recipient.put("name", fullName);
            payload.put("to", List.of(recipient));

            // Subject
            payload.put("subject", subject);

            // HTML content
            String htmlContent = buildOtpEmailHtml(fullName, otp, title, message);
            payload.put("htmlContent", htmlContent);

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("OTP email sent successfully to: {}", toEmail);
            } else {
                log.error("Failed to send OTP email. Status: {}, Body: {}", response.statusCode(), response.body());
            }

        } catch (Exception e) {
            log.error("Error sending OTP email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildOtpEmailHtml(String fullName, String otp, String title, String message) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                                    <tr>
                                        <td style="background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);padding:32px;text-align:center;">
                                            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">RuinMIT</h1>
                                            <p style="color:#e8e0ff;margin:8px 0 0;font-size:14px;">%s</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:32px;">
                                            <p style="color:#333;font-size:16px;margin:0 0 16px;">Hi <strong>%s</strong>,</p>
                                            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                                                %s This code is valid for <strong>10 minutes</strong>.
                                            </p>
                                            <div style="background:#f0edff;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
                                                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#5b3cc4;">%s</span>
                                            </div>
                                            <p style="color:#999;font-size:13px;line-height:1.5;margin:0;">
                                                If you didn't request this, please ignore this email. Do not share this OTP with anyone.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
                                            <p style="color:#aaa;font-size:12px;margin:0;">&copy; 2026 RuinMIT &bull; MIT-WPU</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(title, fullName, message, otp);
    }

    private String buildNotificationEmailHtml(String title, String message) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                                    <tr>
                                        <td style="background:linear-gradient(135deg,#667eea 0%%,#764ba2 100%%);padding:32px;text-align:center;">
                                            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">RuinMIT</h1>
                                            <p style="color:#e8e0ff;margin:8px 0 0;font-size:14px;">%s</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:32px;">
                                            <p style="color:#555;font-size:15px;line-height:1.6;margin:0;">%s</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
                                            <p style="color:#aaa;font-size:12px;margin:0;">&copy; 2026 RuinMIT &bull; MIT-WPU</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(title, message);
    }
}
