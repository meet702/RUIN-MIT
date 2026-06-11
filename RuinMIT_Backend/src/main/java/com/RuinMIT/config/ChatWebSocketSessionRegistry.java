package com.RuinMIT.config;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketSessionRegistry {

    private final ConcurrentHashMap<String, Authentication> sessions = new ConcurrentHashMap<>();

    public void register(String sessionId, Authentication authentication) {
        if (sessionId != null && authentication != null) {
            sessions.put(sessionId, authentication);
        }
    }

    public void unregister(String sessionId) {
        if (sessionId != null) {
            sessions.remove(sessionId);
        }
    }

    public Optional<Authentication> getAuthentication(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }
}
