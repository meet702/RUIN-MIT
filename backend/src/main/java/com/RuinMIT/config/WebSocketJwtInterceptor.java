package com.RuinMIT.config;

import com.RuinMIT.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketJwtInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ChatWebSocketSessionRegistry sessionRegistry;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = resolveToken(accessor);
            if (token != null) {
                String userEmail = jwtService.extractUsername(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    accessor.setUser(authentication);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    sessionRegistry.register(accessor.getSessionId(), authentication);
                }
            }
        } else if (accessor != null && StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            sessionRegistry.unregister(accessor.getSessionId());
        }

        return message;
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return accessor.getFirstNativeHeader("token");
    }
}
