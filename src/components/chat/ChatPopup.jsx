import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Minus, Send, X } from "lucide-react";
import { chatService, getChatToken } from "../../services/ChatService";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import { useChat } from "../../context/ChatContext";
import ConversationTypeIcon, { getTypeConfig } from "./ConversationTypeIcon";

function getCurrentUserId() {
  const storedUserId = localStorage.getItem("userId");
  if (storedUserId) {
    return storedUserId;
  }

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser)?.id;
    } catch {
      return null;
    }
  }

  const token = getChatToken();
  if (!token) {
    return null;
  }

  try {
    return JSON.parse(atob(token.split(".")[1]))?.id || null;
  } catch {
    return null;
  }
}

function formatTime(value) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatRelativeTime(value) {
  if (!value) {
    return "";
  }

  const ms = Date.now() - new Date(value).getTime();
  const seconds = Math.max(1, Math.floor(ms / 1000));
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(value).toLocaleDateString();
}

const FILTER_TABS = [
  { key: "all",         label: "All" },
  { key: "gig",         label: "Gigs" },
  { key: "ride",        label: "Rides" },
  { key: "marketplace", label: "Market" },
  { key: "flatmate",    label: "Flat" },
  { key: "lost_found",  label: "L&F" },
];

export default function ChatPopup() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const currentUserId = useMemo(getCurrentUserId, []);
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    isChatOpen,
    setIsChatOpen,
    loadConversations,
    openConversation: openConversationFromContext,
    upsertConversation,
  } = useChat();
  const conversationIds = useMemo(() => conversations.map((conversation) => conversation.id).join(","), [conversations]);
  const { isConnected, subscribeToConversation, sendMessage } = useChatWebSocket();
  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [activeConversationId, conversations]
  );

  const unreadTotal = conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0);

  const filteredConversations = useMemo(
    () => activeFilter === "all"
      ? conversations
      : conversations.filter((c) => c.referenceType === activeFilter),
    [conversations, activeFilter]
  );

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }));
  }, []);

  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setError("");
    try {
      await loadConversations();
    } catch {
      setError("Could not load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  }, [loadConversations]);

  const openConversation = useCallback(async (conversation) => {
    openConversationFromContext(conversation);
    setIsLoadingMessages(true);
    setError("");

    try {
      const response = await chatService.getChatHistory(conversation.id);
      if (response.success) {
        setMessages(response.data || []);
        setConversations((items) => items.map((item) => (
          item.id === conversation.id ? { ...item, unreadCount: 0 } : item
        )));
        scrollToBottom();
      }
    } catch {
      setError("Could not load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [openConversationFromContext, scrollToBottom, setConversations]);

  useEffect(() => {
    const handleOpenChat = async (event) => {
      const conversation = event.detail;
      upsertConversation(conversation);
      await openConversation(conversation);
    };

    window.addEventListener("ruinmit:open-chat", handleOpenChat);
    return () => window.removeEventListener("ruinmit:open-chat", handleOpenChat);
  }, [openConversation, upsertConversation]);

  useEffect(() => {
    if (isChatOpen) {
      fetchConversations();
    }
  }, [fetchConversations, isChatOpen]);

  useEffect(() => {
    if (selectedConversation) {
      openConversation(selectedConversation);
    }
  }, [activeConversationId]);

  useEffect(() => {
    const unsubscribers = conversations.map((conversation) => (
      subscribeToConversation(conversation.id, (incomingMessage) => {
        const isActiveConversation = activeConversationId === incomingMessage.conversationId;

        if (isActiveConversation) {
          setMessages((items) => (
            items.some((item) => item.id === incomingMessage.id) ? items : [...items, incomingMessage]
          ));
          window.dispatchEvent(new CustomEvent("ruinmit:active-chat-message", {
            detail: {
              conversationId: incomingMessage.conversationId,
              content: incomingMessage.content,
              senderName: incomingMessage.senderName,
            },
          }));
          scrollToBottom();
        }

        setConversations((items) => items.map((item) => (
          item.id === incomingMessage.conversationId
            ? {
                ...item,
                lastMessage: incomingMessage.content,
                lastMessageAt: incomingMessage.createdAt,
                unreadCount: isActiveConversation || incomingMessage.senderId === currentUserId
                  ? item.unreadCount
                  : (item.unreadCount || 0) + 1,
              }
            : item
        )));
      })
    ));

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [activeConversationId, conversationIds, currentUserId, scrollToBottom, subscribeToConversation]);

  const handleSend = () => {
    const content = messageText.trim();
    if (!content || !selectedConversation) {
      return;
    }

    const sent = sendMessage(selectedConversation.id, content);
    if (sent) {
      setMessageText("");
      setError("");
    } else {
      setError("Reconnecting. Try again in a moment.");
    }
  };

  if (!isChatOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ruin-orange text-ruin-background shadow-xl transition-transform hover:scale-105"
        aria-label="Open messages"
      >
        <MessageCircle size={24} />
        {unreadTotal > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-ruin-magenta px-1.5 py-0.5 text-xs font-bold text-white">
            {unreadTotal}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-h-[78vh] overflow-hidden rounded-lg border border-ruin-border bg-ruin-card shadow-2xl">
      <div className="flex w-[300px] flex-col border-r border-ruin-border">
        <div className="flex h-14 items-center justify-between border-b border-ruin-border px-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-ruin-text">Messages</h2>
            {!isConnected && <p className="text-xs text-ruin-muted">Reconnecting...</p>}
          </div>
          <button type="button" onClick={() => setIsChatOpen(false)} className="text-ruin-muted hover:text-ruin-text" aria-label="Minimize messages">
            <Minus size={18} />
          </button>
        </div>

        <div className="border-b border-ruin-border px-2 py-2 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`shrink-0 rounded-full px-2.5 py-1 font-heading text-[10px] font-semibold tracking-[0.04em] transition duration-200 ease-out ${
                  activeFilter === tab.key
                    ? "bg-ruin-orange text-ruin-background shadow-sm"
                    : "bg-transparent text-ruin-muted hover:text-ruin-text hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[320px] flex-1 overflow-y-auto custom-scrollbar">
          {isLoadingConversations && (
            <div className="space-y-1 p-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg p-2.5">
                  <div className="h-[26px] w-[26px] shrink-0 animate-pulse rounded-md bg-ruin-border/40" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-ruin-border/40" />
                    <div className="h-2.5 w-full animate-pulse rounded bg-ruin-border/30" />
                    <div className="h-2.5 w-1/2 animate-pulse rounded bg-ruin-border/20" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoadingConversations && filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <MessageCircle size={28} className="text-ruin-muted/40" />
              <p className="text-sm text-ruin-muted">
                {activeFilter === "all" ? "No conversations yet" : `No ${FILTER_TABS.find(t => t.key === activeFilter)?.label || ""} chats`}
              </p>
            </div>
          )}
          {!isLoadingConversations && filteredConversations.map((conversation) => {
            const { color } = getTypeConfig(conversation.referenceType);
            const isActive = activeConversationId === conversation.id;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => openConversation(conversation)}
                className={`group w-full border-b border-ruin-border/50 px-3 py-2.5 text-left transition-colors hover:bg-ruin-background/80 ${
                  isActive ? "bg-ruin-background border-l-2" : "border-l-2 border-l-transparent"
                }`}
                style={isActive ? { borderLeftColor: color } : undefined}
              >
                <div className="flex items-start gap-2.5">
                  <ConversationTypeIcon referenceType={conversation.referenceType} size={14} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-ruin-text">
                        {conversation.otherParticipant?.name || conversation.otherUserName}
                      </span>
                      <span className="shrink-0 text-[10px] text-ruin-muted">
                        {formatRelativeTime(conversation.lastMessageAt || conversation.createdAt)}
                      </span>
                    </div>
                    <p
                      className="mt-0.5 truncate text-[11px] font-medium"
                      style={{ color: `${color}CC` }}
                    >
                      {conversation.referenceTitle || conversation.referenceType}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-[11px] text-ruin-muted" title={conversation.lastMessage || ""}>
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ruin-magenta px-1 text-[10px] font-bold text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedConversation && (
        <div className="flex w-[400px] flex-col">
          <div className="flex h-14 items-center justify-between border-b border-ruin-border px-4">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-ruin-text">{selectedConversation.otherParticipant?.name || selectedConversation.otherUserName}</h3>
              <p className="truncate text-xs text-ruin-muted">
                Re: {selectedConversation.referenceType} - {selectedConversation.referenceTitle || selectedConversation.referenceId}
              </p>
            </div>
            <button type="button" onClick={() => setActiveConversationId(null)} className="text-ruin-muted hover:text-ruin-text" aria-label="Close conversation">
              <X size={18} />
            </button>
          </div>

          <div className="h-[360px] flex-1 overflow-y-auto bg-ruin-background p-4 custom-scrollbar">
            {isLoadingMessages ? (
              <div className="flex h-full flex-col justify-end gap-4 p-2 opacity-50">
                <div className="flex justify-start">
                  <div className="h-12 w-2/3 animate-pulse rounded-lg bg-ruin-card" />
                </div>
                <div className="flex justify-end">
                  <div className="h-16 w-3/4 animate-pulse rounded-lg bg-blue-600/30" />
                </div>
                <div className="flex justify-start">
                  <div className="h-10 w-1/2 animate-pulse rounded-lg bg-ruin-card" />
                </div>
                <div className="flex justify-end">
                  <div className="h-12 w-2/3 animate-pulse rounded-lg bg-blue-600/30" />
                </div>
              </div>
            ) : (
              <>
                {error && <div className="mb-3 rounded-md border border-ruin-magenta/40 p-2 text-sm text-ruin-magenta">{error}</div>}
                {messages.map((message) => {
                  const mine = message.senderId === currentUserId;
                  return (
                    <div key={message.id} className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] ${mine ? "text-right" : "text-left"}`}>
                        <div className={`rounded-lg px-3 py-2 text-sm ${
                          mine ? "bg-blue-600 text-white" : "bg-ruin-card text-ruin-text"
                        }`}>
                          {!mine && <div className="mb-1 text-[11px] font-semibold text-ruin-muted">{message.senderName}</div>}
                          {message.content}
                        </div>
                        <div className="mt-1 text-[11px] text-ruin-muted">{formatTime(message.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="flex gap-2 border-t border-ruin-border p-3">
            <input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="min-w-0 flex-1 rounded-lg border border-ruin-border bg-ruin-background px-3 py-2 text-sm text-ruin-text outline-none focus:border-ruin-orange"
            />
            <button
              type="button"
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-ruin-orange text-ruin-background disabled:opacity-50"
              disabled={!messageText.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
