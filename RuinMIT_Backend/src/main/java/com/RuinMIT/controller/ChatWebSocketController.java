package com.RuinMIT.controller;

import com.RuinMIT.dto.chat.ChatSendRequest;
import com.RuinMIT.dto.chat.MessageResponse;
import com.RuinMIT.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public MessageResponse sendMessage(ChatSendRequest request, Principal principal) {
        if (principal == null) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        return chatService.sendMessage(request.getConversationId(), request.getContent(), principal.getName());
    }
}
