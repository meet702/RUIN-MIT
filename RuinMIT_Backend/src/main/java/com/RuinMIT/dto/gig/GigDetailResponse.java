package com.RuinMIT.dto.gig;

import com.RuinMIT.entity.GigStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GigDetailResponse {
    private UUID id;
    private String title;
    private String description;
    private BigDecimal budget;
    private LocalDateTime deadline;
    private GigStatus status;
    private UUID posterId;
    private String posterFullName;
    private Boolean hasApplied;
    private LocalDateTime createdAt;
    private List<GigApplicationResponse> applications; // Might be null or empty depending on the requester
}
