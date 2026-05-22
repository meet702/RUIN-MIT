package com.RuinMIT.controller;

import com.RuinMIT.dto.ApiResponse;
import com.RuinMIT.dto.flatmate.*;
import com.RuinMIT.entity.GenderPreference;
import com.RuinMIT.entity.ListingStatus;
import com.RuinMIT.service.FlatmateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/flatmates")
@RequiredArgsConstructor
public class FlatmateController {

    private final FlatmateService flatmateService;

    @PostMapping
    public ResponseEntity<ApiResponse<FlatmateListingResponse>> createListing(
            @Valid @RequestBody FlatmateListingRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        FlatmateListingResponse response = flatmateService.createListing(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Flatmate listing created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FlatmateListingResponse>>> getListings(
            @RequestParam(required = false) ListingStatus status,
            @RequestParam(required = false) GenderPreference genderPreference,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<FlatmateListingResponse> responses = flatmateService.getListings(status, genderPreference, page, size);
        return ResponseEntity.ok(ApiResponse.success("Listings retrieved successfully", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlatmateListingDetailResponse>> getListingDetails(
            @PathVariable UUID id,
            Authentication authentication) {

        String requesterEmail = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : null;

        FlatmateListingDetailResponse response = flatmateService.getListingDetails(id, requesterEmail);
        return ResponseEntity.ok(ApiResponse.success("Listing details retrieved successfully", response));
    }

    @PostMapping("/{id}/inquire")
    public ResponseEntity<ApiResponse<Void>> sendInquiry(
            @PathVariable UUID id,
            @Valid @RequestBody FlatmateInquiryRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        flatmateService.sendInquiry(id, request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Inquiry sent successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody FlatmateStatusUpdateRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        flatmateService.updateStatus(id, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Listing status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(
            @PathVariable UUID id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        flatmateService.deleteListing(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully"));
    }
}
