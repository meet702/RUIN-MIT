package com.RuinMIT.controller;

import com.RuinMIT.dto.ApiResponse;
import com.RuinMIT.dto.lostfound.LostAndFoundRequest;
import com.RuinMIT.dto.lostfound.LostAndFoundResponse;
import com.RuinMIT.dto.lostfound.UpdateLostFoundStatusRequest;
import com.RuinMIT.entity.LostFoundStatus;
import com.RuinMIT.entity.LostFoundType;
import com.RuinMIT.service.LostAndFoundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/lost-found")
@RequiredArgsConstructor
public class LostAndFoundController {

    private final LostAndFoundService lostAndFoundService;

    @PostMapping
    public ResponseEntity<ApiResponse<LostAndFoundResponse>> createPost(
            @Valid @RequestBody LostAndFoundRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        LostAndFoundResponse response = lostAndFoundService.createPost(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lost/Found post created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LostAndFoundResponse>>> getAllPosts(
            @RequestParam(required = false) LostFoundType type,
            @RequestParam(required = false) LostFoundStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<LostAndFoundResponse> response = lostAndFoundService.getAllPosts(type, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Posts retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LostAndFoundResponse>> getPostById(@PathVariable UUID id) {
        LostAndFoundResponse response = lostAndFoundService.getPostById(id);
        return ResponseEntity.ok(ApiResponse.success("Post details retrieved successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<LostAndFoundResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLostFoundStatusRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        LostAndFoundResponse response = lostAndFoundService.updateStatus(id, request.getStatus(), userEmail);
        return ResponseEntity.ok(ApiResponse.success("Post status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable UUID id,
            Authentication authentication) {

        String userEmail = authentication.getName();
        lostAndFoundService.deletePost(id, userEmail);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully"));
    }
}
