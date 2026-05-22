package com.RuinMIT.controller;

import com.RuinMIT.dto.ApiResponse;
import com.RuinMIT.dto.gig.*;
import com.RuinMIT.service.GigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/gigs")
@RequiredArgsConstructor
public class GigController {

    private final GigService gigService;

    @PostMapping
    public ResponseEntity<ApiResponse<GigResponse>> createGig(
            @Valid @RequestBody GigCreateRequest request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        GigResponse response = gigService.createGig(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gig created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GigResponse>>> getOpenGigs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<GigResponse> openGigs = gigService.getOpenGigs(page, size);
        return ResponseEntity.ok(ApiResponse.success("Open gigs retrieved successfully", openGigs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GigDetailResponse>> getGigDetails(
            @PathVariable UUID id,
            Authentication authentication) {
        
        String userEmail = (authentication != null && authentication.isAuthenticated()) 
                ? authentication.getName() 
                : null;
                
        GigDetailResponse response = gigService.getGigDetails(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Gig details retrieved successfully", response));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<Void>> applyToGig(
            @PathVariable UUID id,
            @RequestBody GigApplyRequest request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        gigService.applyToGig(id, request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Applied to gig successfully"));
    }

    @PostMapping("/{id}/applications/{applicationId}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptApplicant(
            @PathVariable UUID id,
            @PathVariable UUID applicationId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        gigService.acceptApplicant(id, applicationId, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Applicant accepted successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateGigStatus(
            @PathVariable UUID id,
            @Valid @RequestBody GigStatusUpdateRequest request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        gigService.updateGigStatus(id, request, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Gig status updated successfully"));
    }
}
