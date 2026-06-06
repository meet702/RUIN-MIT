package com.RuinMIT.controller;

import com.RuinMIT.dto.ApiResponse;
import com.RuinMIT.dto.marketplace.*;
import com.RuinMIT.entity.ItemCondition;
import com.RuinMIT.entity.MarketplaceCategory;
import com.RuinMIT.entity.MarketplaceStatus;
import com.RuinMIT.service.MarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    private String getAuthenticatedEmail(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)
                ? authentication.getName()
                : null;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MarketplaceListingResponse>> createListing(
            @Valid @RequestBody MarketplaceListingRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        MarketplaceListingResponse response = marketplaceService.createListing(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Marketplace listing created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MarketplaceListingResponse>>> getListings(
            @RequestParam(required = false) MarketplaceCategory category,
            @RequestParam(required = false) ItemCondition condition,
            @RequestParam(required = false) MarketplaceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<MarketplaceListingResponse> responses = marketplaceService.getListings(category, condition, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Listings retrieved successfully", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MarketplaceListingDetailResponse>> getListingDetails(
            @PathVariable UUID id,
            Authentication authentication) {

        String requesterEmail = getAuthenticatedEmail(authentication);

        MarketplaceListingDetailResponse response = marketplaceService.getListingDetails(id, requesterEmail);
        return ResponseEntity.ok(ApiResponse.success("Listing details retrieved successfully", response));
    }

    @PostMapping("/{id}/inquire")
    public ResponseEntity<ApiResponse<Void>> sendInquiry(
            @PathVariable UUID id,
            @Valid @RequestBody MarketplaceInquiryRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        marketplaceService.sendInquiry(id, request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Inquiry sent successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody MarketplaceStatusUpdateRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        marketplaceService.updateStatus(id, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Listing status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(
            @PathVariable UUID id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        marketplaceService.deleteListing(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully"));
    }
}
