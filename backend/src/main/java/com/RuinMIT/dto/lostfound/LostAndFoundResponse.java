package com.RuinMIT.dto.lostfound;

import com.RuinMIT.entity.LostFoundStatus;
import com.RuinMIT.entity.LostFoundType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LostAndFoundResponse {

    private UUID id;
    private LostFoundType type;
    private String title;
    private String description;
    private String locationFoundLost;
    private LostFoundStatus status;
    private PosterInfo poster;
    private List<String> imageUrls;
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
