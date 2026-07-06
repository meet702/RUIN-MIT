package com.RuinMIT.controller;

import com.RuinMIT.dto.ApiResponse;
import com.RuinMIT.dto.ride.*;
import com.RuinMIT.entity.RideStatus;
import com.RuinMIT.entity.VehicleType;
import com.RuinMIT.service.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @PostMapping
    public ResponseEntity<ApiResponse<RideResponse>> createRide(
            @Valid @RequestBody RideCreateRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        RideResponse response = rideService.createRide(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ride created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RideResponse>>> getRides(
            @RequestParam(required = false) RideStatus status,
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<RideResponse> rides = rideService.getRides(status, vehicleType, page, size);
        return ResponseEntity.ok(ApiResponse.success("Rides retrieved successfully", rides));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RideDetailResponse>> getRideDetails(@PathVariable UUID id) {
        RideDetailResponse response = rideService.getRideDetails(id);
        return ResponseEntity.ok(ApiResponse.success("Ride details retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RideResponse>> updateRide(
            @PathVariable UUID id,
            @Valid @RequestBody RideCreateRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        RideResponse response = rideService.updateRide(id, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Ride updated successfully", response));
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<ApiResponse<Void>> bookRide(
            @PathVariable UUID id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        rideService.bookRide(id, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ride booked successfully"));
    }

    @DeleteMapping("/{id}/book")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
            @PathVariable UUID id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        rideService.cancelBooking(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateRideStatus(
            @PathVariable UUID id,
            @Valid @RequestBody RideStatusUpdateRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        rideService.updateRideStatus(id, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Ride status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRide(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        rideService.deleteRide(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Ride deleted successfully"));
    }
}
