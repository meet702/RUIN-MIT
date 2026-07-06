package com.RuinMIT.dto.lostfound;

import com.RuinMIT.entity.LostFoundType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LostAndFoundRequest {

    @NotNull(message = "Type is required. Must be 'lost' or 'found'")
    private LostFoundType type;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String locationFoundLost;

    private List<String> imageUrls;
}
