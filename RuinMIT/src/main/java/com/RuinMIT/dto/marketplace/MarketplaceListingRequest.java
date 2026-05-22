package com.RuinMIT.dto.marketplace;

import com.RuinMIT.entity.ItemCondition;
import com.RuinMIT.entity.MarketplaceCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceListingRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be a positive value")
    private BigDecimal price;

    @NotNull(message = "Category is required")
    private MarketplaceCategory category;

    @NotNull(message = "Condition is required")
    private ItemCondition condition;

    private String imageUrl;
}
