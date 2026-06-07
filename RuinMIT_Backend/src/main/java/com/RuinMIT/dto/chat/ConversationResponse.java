package com.RuinMIT.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ConversationResponse {
    private UUID id;
    private UUID conversationId;
    private UUID otherUserId;
    private String otherUserName;
    private ParticipantResponse otherParticipant;
    private String referenceType;
    private UUID referenceId;
    private String referenceTitle;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private long unreadCount;

    @Data
    @Builder
    public static class ParticipantResponse {
        private UUID id;
        private String name;
    }
}
