import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { chatService } from "../services/ChatService";

const ChatContext = createContext(undefined);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const upsertConversation = useCallback((conversation) => {
    setConversations((items) => {
      const exists = items.some((item) => item.id === conversation.id);
      const next = exists
        ? items.map((item) => item.id === conversation.id ? { ...item, ...conversation } : item)
        : [conversation, ...items];

      return next.sort((a, b) => new Date(b.lastMessageAt || b.createdAt || 0) - new Date(a.lastMessageAt || a.createdAt || 0));
    });
  }, []);

  const loadConversations = useCallback(async () => {
    const response = await chatService.getConversations();
    if (response.success) {
      setConversations(response.data || []);
    }
    return response;
  }, []);

  const openConversation = useCallback((conversationOrId) => {
    const conversationId = typeof conversationOrId === "string" ? conversationOrId : conversationOrId?.id;
    if (typeof conversationOrId === "object" && conversationOrId?.id) {
      upsertConversation(conversationOrId);
    }
    setActiveConversationId(conversationId);
    setIsChatOpen(true);
  }, [upsertConversation]);

  const startAndOpenConversation = useCallback(async (otherUserId, referenceType, referenceId) => {
    const response = await chatService.startConversation(otherUserId, referenceType, referenceId);
    if (response.success) {
      openConversation(response.data);
    }
    return response;
  }, [openConversation]);

  const value = useMemo(() => ({
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    isChatOpen,
    setIsChatOpen,
    loadConversations,
    openConversation,
    startAndOpenConversation,
    upsertConversation,
  }), [
    activeConversationId,
    conversations,
    isChatOpen,
    loadConversations,
    openConversation,
    startAndOpenConversation,
    upsertConversation,
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
