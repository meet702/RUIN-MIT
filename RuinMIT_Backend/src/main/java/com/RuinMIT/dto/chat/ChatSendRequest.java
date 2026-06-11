package com.RuinMIT.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ChatSendRequest {
    @NotNull
    private UUID conversationId;

    @NotBlank
    private String content;
}
