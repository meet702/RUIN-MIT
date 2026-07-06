package com.RuinMIT.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private UUID id;
    private String title;
    private String message;
    private String type;
    private UUID referenceId;
    @JsonProperty("isRead")
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
