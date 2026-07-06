package com.RuinMIT.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageDeleteRequest {

    @NotBlank(message = "Image URL is required")
    private String imageUrl;
}
