package com.RuinMIT.dto.lostfound;

import com.RuinMIT.entity.LostFoundStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLostFoundStatusRequest {

    @NotNull(message = "Status is required")
    private LostFoundStatus status;
}
