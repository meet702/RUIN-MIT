package com.RuinMIT.service;

import com.RuinMIT.dto.notification.NotificationResponse;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class SseEmitterService {

    private static final long HEARTBEAT_INTERVAL_SECONDS = 15;

    private final ConcurrentHashMap<UUID, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService heartbeatExecutor = Executors.newScheduledThreadPool(1, runnable -> {
        Thread thread = new Thread(runnable);
        thread.setDaemon(true);
        thread.setName("notification-sse-heartbeat");
        return thread;
    });

    public void addEmitter(UUID userId, SseEmitter emitter) {
        emitters.computeIfAbsent(userId, key -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(error -> removeEmitter(userId, emitter));

        heartbeatExecutor.scheduleAtFixedRate(
                () -> sendHeartbeat(userId, emitter),
                HEARTBEAT_INTERVAL_SECONDS,
                HEARTBEAT_INTERVAL_SECONDS,
                TimeUnit.SECONDS);
    }

    public void removeEmitter(UUID userId) {
        emitters.remove(userId);
    }

    public void sendNotification(UUID userId, NotificationResponse notification) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().data(notification));
            } catch (IOException | IllegalStateException ex) {
                log.debug("Removing stale SSE emitter for user {}", userId);
                removeEmitter(userId, emitter);
            }
        }
    }

    private void sendHeartbeat(UUID userId, SseEmitter emitter) {
        if (!isEmitterActive(userId, emitter)) {
            return;
        }

        try {
            emitter.send(SseEmitter.event().comment("heartbeat"));
        } catch (IOException | IllegalStateException ex) {
            removeEmitter(userId, emitter);
        }
    }

    private boolean isEmitterActive(UUID userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        return userEmitters != null && userEmitters.contains(emitter);
    }

    private void removeEmitter(UUID userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null) {
            return;
        }

        userEmitters.remove(emitter);
        if (userEmitters.isEmpty()) {
            emitters.remove(userId, userEmitters);
        }
    }

    @PreDestroy
    public void shutdown() {
        heartbeatExecutor.shutdownNow();
    }
}
