package com.RuinMIT.dto.gig;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GigApplicationResponse {
    private UUID id;
    private UUID applicantId;
    private String applicantFullName;
    private String message;
    private Boolean isAccepted;
    private LocalDateTime createdAt;
}
