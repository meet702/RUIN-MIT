package com.RuinMIT.dto.flatmate;

import com.RuinMIT.entity.ListingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlatmateStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ListingStatus status;
}
