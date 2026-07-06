package com.RuinMIT.dto.flatmate;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlatmateInquiryRequest {

    @NotBlank(message = "Message is required")
    private String message;
}
