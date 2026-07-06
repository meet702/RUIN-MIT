package com.RuinMIT.dto.flatmate;

import com.RuinMIT.entity.GenderPreference;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlatmateListingRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Rent per month is required")
    @Min(value = 0, message = "Rent must be a positive value")
    private BigDecimal rentPerMonth;

    @NotNull(message = "Available from date is required")
    private LocalDate availableFrom;

    @NotNull(message = "Gender preference is required")
    private GenderPreference genderPreference;

    private String amenities;

    private List<String> imageUrls;
}
