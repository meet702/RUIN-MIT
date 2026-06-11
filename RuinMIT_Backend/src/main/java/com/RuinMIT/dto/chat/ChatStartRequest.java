package com.RuinMIT.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ChatStartRequest {
    @NotNull
    private UUID otherUserId;

    @NotBlank
    private String referenceType;

    @NotNull
    private UUID referenceId;
}
