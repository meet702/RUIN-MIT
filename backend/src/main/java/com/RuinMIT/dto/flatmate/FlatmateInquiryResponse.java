package com.RuinMIT.dto.flatmate;

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
public class FlatmateInquiryResponse {

    private UUID id;
    private String message;
    private SenderInfo sender;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SenderInfo {
        private UUID id;
        private String fullName;
    }
}
