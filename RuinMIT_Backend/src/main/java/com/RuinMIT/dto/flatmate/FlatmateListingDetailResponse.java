package com.RuinMIT.dto.flatmate;

import com.RuinMIT.entity.GenderPreference;
import com.RuinMIT.entity.ListingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlatmateListingDetailResponse {

    private UUID id;
    private String title;
    private String description;
    private String location;
    private BigDecimal rentPerMonth;
    private LocalDate availableFrom;
    private GenderPreference genderPreference;
    private String amenities;
    private ListingStatus status;
    private FlatmateListingResponse.PosterInfo poster;
    private Boolean hasInquired;
    private List<FlatmateInquiryResponse> inquiries; // Null if requester is not the poster
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
