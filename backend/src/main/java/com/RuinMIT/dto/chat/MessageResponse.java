package com.RuinMIT.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MessageResponse {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String senderName;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
