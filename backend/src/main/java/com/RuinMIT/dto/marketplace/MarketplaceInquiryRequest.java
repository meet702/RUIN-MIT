package com.RuinMIT.dto.marketplace;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceInquiryRequest {

    @NotBlank(message = "Message is required")
    private String message;
}
