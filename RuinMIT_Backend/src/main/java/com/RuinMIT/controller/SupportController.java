package com.RuinMIT.controller;

import com.RuinMIT.dto.ApiResponse;
import com.RuinMIT.dto.support.ContactRequest;
import com.RuinMIT.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/contact")
    public ResponseEntity<ApiResponse<Void>> contact(
            @Valid @RequestBody ContactRequest request,
            Authentication authentication) {

        supportService.sendContactMessage(
                request.getCategory(),
                request.getMessage(),
                authentication.getName());

        return ResponseEntity.ok(ApiResponse.success("Message sent successfully"));
    }
}
