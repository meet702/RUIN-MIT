package com.RuinMIT.dto.ride;

import com.RuinMIT.entity.RideStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RideStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private RideStatus status;
}
