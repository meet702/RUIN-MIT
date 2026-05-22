package com.RuinMIT.dto.ride;

import com.RuinMIT.entity.RideStatus;
import com.RuinMIT.entity.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideResponse {

    private UUID id;
    private VehicleType vehicleType;
    private String fromLocation;
    private String toLocation;
    private LocalDateTime departureTime;
    private Integer totalSeats;
    private Integer availableSeats;
    private BigDecimal farePerPerson;
    private RideStatus status;
    private String notes;
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
