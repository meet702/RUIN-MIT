package com.RuinMIT.controller;

import com.RuinMIT.dto.ApiResponse;
import com.RuinMIT.dto.chat.ChatStartRequest;
import com.RuinMIT.dto.chat.ConversationResponse;
import com.RuinMIT.dto.chat.MessageResponse;
import com.RuinMIT.repository.UserRepository;
import com.RuinMIT.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(Authentication authentication) {
        List<ConversationResponse> conversations = chatService.getConversations(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved successfully", conversations));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getChatHistory(
            @PathVariable UUID conversationId,
            Authentication authentication) {
        List<MessageResponse> messages = chatService.getChatHistory(conversationId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully", messages));
    }

    @PostMapping("/conversations/start")
    public ResponseEntity<ApiResponse<ConversationResponse>> startConversation(
            @Valid @RequestBody ChatStartRequest request,
            Authentication authentication) {
        UUID currentUserId = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new com.RuinMIT.exception.ResourceNotFoundException("User not found"))
                .getId();

        ConversationResponse conversation = chatService.getOrCreateConversation(
                currentUserId,
                request.getOtherUserId(),
                request.getReferenceType(),
                request.getReferenceId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Conversation ready", conversation));
    }
}
