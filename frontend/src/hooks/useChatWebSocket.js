import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getChatToken } from "../services/ChatService";

export function useChatWebSocket() {
  const clientRef = useRef(null);
  const subscriptionsRef = useRef(new Map());
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const token = getChatToken();
    if (!token || clientRef.current?.active) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        token,
      },
      reconnectDelay: 3000,
      onConnect: () => {
        setIsConnected(true);
        subscriptionsRef.current.forEach(({ onMessageReceived }, conversationId) => {
          const subscription = client.subscribe(`/queue/conversation/${conversationId}`, (message) => {
            onMessageReceived(JSON.parse(message.body));
          });
          subscriptionsRef.current.set(conversationId, { onMessageReceived, subscription });
        });
      },
      onDisconnect: () => setIsConnected(false),
      onWebSocketClose: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
    });

    client.activate();
    clientRef.current = client;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      subscriptionsRef.current.forEach(({ subscription }) => subscription?.unsubscribe());
      subscriptionsRef.current.clear();
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [connect]);

  const subscribeToConversation = useCallback((conversationId, onMessageReceived) => {
    if (!conversationId) {
      return () => {};
    }

    subscriptionsRef.current.get(conversationId)?.subscription?.unsubscribe();
    const client = clientRef.current;
    let subscription = null;

    if (client?.connected) {
      subscription = client.subscribe(`/queue/conversation/${conversationId}`, (message) => {
        onMessageReceived(JSON.parse(message.body));
      });
    } else {
      connect();
    }

    subscriptionsRef.current.set(conversationId, { onMessageReceived, subscription });

    return () => {
      subscriptionsRef.current.get(conversationId)?.subscription?.unsubscribe();
      subscriptionsRef.current.delete(conversationId);
    };
  }, [connect]);

  const unsubscribeFromConversation = useCallback((conversationId) => {
    subscriptionsRef.current.get(conversationId)?.subscription?.unsubscribe();
    subscriptionsRef.current.delete(conversationId);
  }, []);

  const sendMessage = useCallback((conversationId, content) => {
    const client = clientRef.current;
    if (!client?.connected) {
      connect();
      return false;
    }

    client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ conversationId, content }),
    });
    return true;
  }, [connect]);

  const disconnect = useCallback(() => {
    subscriptionsRef.current.forEach(({ subscription }) => subscription?.unsubscribe());
    subscriptionsRef.current.clear();
    clientRef.current?.deactivate();
    clientRef.current = null;
    setIsConnected(false);
  }, []);

  return { isConnected, subscribeToConversation, unsubscribeFromConversation, sendMessage, disconnect };
}
