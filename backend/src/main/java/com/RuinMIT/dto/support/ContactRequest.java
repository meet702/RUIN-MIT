package com.RuinMIT.dto.support;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ContactRequest {

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "help|feedback|bug", message = "Category must be 'help', 'feedback', or 'bug'")
    private String category;

    @NotBlank(message = "Message is required")
    private String message;
}
