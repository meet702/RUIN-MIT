package com.RuinMIT.dto.marketplace;

import com.RuinMIT.entity.ItemCondition;
import com.RuinMIT.entity.MarketplaceCategory;
import com.RuinMIT.entity.MarketplaceStatus;
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
public class MarketplaceListingDetailResponse {

    private UUID id;
    private String title;
    private String description;
    private BigDecimal price;
    private MarketplaceCategory category;
    private ItemCondition condition;
    private MarketplaceStatus status;
    private String imageUrl;
    private MarketplaceListingResponse.PosterInfo poster;
    private List<MarketplaceInquiryResponse> inquiries; // Null if requester is not the poster
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
