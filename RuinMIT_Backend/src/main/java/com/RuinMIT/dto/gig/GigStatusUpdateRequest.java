package com.RuinMIT.dto.gig;

import com.RuinMIT.entity.GigStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GigStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private GigStatus status;
}
