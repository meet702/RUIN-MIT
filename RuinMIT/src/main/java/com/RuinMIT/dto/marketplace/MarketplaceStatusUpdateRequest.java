package com.RuinMIT.dto.marketplace;

import com.RuinMIT.entity.MarketplaceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private MarketplaceStatus status;
}
