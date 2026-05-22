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
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlatmateListingResponse {

    private UUID id;
    private String title;
    private String description;
    private String location;
    private BigDecimal rentPerMonth;
    private LocalDate availableFrom;
    private GenderPreference genderPreference;
    private String amenities;
    private ListingStatus status;
    private PosterInfo poster;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PosterInfo {
        private UUID id;
        private String fullName;
    }
}
