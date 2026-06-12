import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import notificationService from "../services/NotificationService";
import { useChat } from "../context/ChatContext";

const formatTimeAgo = (dateValue) => {
  if (!dateValue) return "";

  const createdAt = new Date(dateValue);
  const seconds = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / 1000));

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  return createdAt.toLocaleDateString();
};

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // 'sine' or 'triangle' produce the cleanest, most bell-like tones
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Attack and release for a softer, bell-like envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02); // quick fade in
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // smooth fade out
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Play a friendly, recognizable double-chime (Major 3rd interval: C5 then E5)
    playTone(523.25, now, 0.4);        // C5
    playTone(659.25, now + 0.15, 0.5); // E5
  } catch (err) {
    console.error("Failed to play notification sound", err);
  }
};

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const isMessageNotification = (notification) => {
  const title = normalize(notification?.title);
  const type = normalize(notification?.type ?? notification?.notificationType ?? notification?.category);

  return type.includes("chat")
    || type.includes("message")
    || title.startsWith("new message from");
};

const getNotificationConversationId = (notification) => (
  notification?.conversationId
  ?? notification?.data?.conversationId
  ?? notification?.metadata?.conversationId
  ?? (isMessageNotification(notification) ? notification?.referenceId : null)
  ?? (notification?.referenceType === "chat" ? notification?.referenceId : null)
);

const isNotificationForRecentActiveMessage = (notification, recentMessages) => {
  const title = normalize(notification?.title);
  const message = normalize(notification?.message);
  const now = Date.now();

  return recentMessages.some((recentMessage) => (
    now - recentMessage.receivedAt < 10000
    && normalize(recentMessage.content) === message
    && (
      !recentMessage.senderName
      || title.includes(normalize(recentMessage.senderName))
    )
  ));
};

const isNotificationForActiveChat = (notification, chatState, recentMessages) => {
  if (!chatState.isChatOpen || !chatState.activeConversationId || !isMessageNotification(notification)) {
    return false;
  }

  const notificationConversationId = getNotificationConversationId(notification);
  if (notificationConversationId) {
    return String(notificationConversationId) === String(chatState.activeConversationId);
  }

  return isNotificationForRecentActiveMessage(notification, recentMessages);
};

export default function NotificationBell() {
  const { activeConversationId, isChatOpen, openConversation } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const shouldReconnectRef = useRef(true);
  const chatStateRef = useRef({ activeConversationId: null, isChatOpen: false });
  const recentActiveMessagesRef = useRef([]);

  useEffect(() => {
    chatStateRef.current = { activeConversationId, isChatOpen };
  }, [activeConversationId, isChatOpen]);

  useEffect(() => {
    const handleActiveChatMessage = (event) => {
      const { conversationId, content, senderName } = event.detail || {};
      if (!conversationId || !content) {
        return;
      }

      recentActiveMessagesRef.current = [
        { conversationId, content, senderName, receivedAt: Date.now() },
        ...recentActiveMessagesRef.current,
      ].slice(0, 5);
    };

    window.addEventListener("ruinmit:active-chat-message", handleActiveChatMessage);
    return () => window.removeEventListener("ruinmit:active-chat-message", handleActiveChatMessage);
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(Number(data?.count ?? 0));
    } catch (err) {
      console.error("Failed to load unread notification count", err);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await notificationService.getNotifications();
      const loadedNotifications = Array.isArray(data) ? data.slice(0, 10) : [];
      setNotifications(loadedNotifications);
      
      // Fallback: if loadUnreadCount missed it, sync from the top 10 list
      const localUnread = loadedNotifications.filter((n) => n.isRead === false).length;
      setUnreadCount((prev) => Math.max(prev, localUnread));
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError("Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = true; // Fix for React Strict Mode double-invoke
    loadUnreadCount();
    loadNotifications();

    const connectSSE = () => {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!token || !shouldReconnectRef.current) {
        return;
      }

      eventSourceRef.current?.close();

      const eventSource = new EventSource(
        `http://localhost:8089/api/notifications/stream?token=${encodeURIComponent(token)}`,
        { withCredentials: true }
      );

      eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          const isActiveChatNotification = isNotificationForActiveChat(
            notification,
            chatStateRef.current,
            recentActiveMessagesRef.current
          );

          if (isActiveChatNotification) {
            if (notification.isRead === false && notification.id) {
              notificationService.markAsRead(notification.id).catch((err) => {
                console.error("Failed to mark active chat notification as read", err);
              });
            }
            return;
          }

          setNotifications((current) => {
            const withoutDuplicate = current.filter((item) => item.id !== notification.id);
            return [notification, ...withoutDuplicate].slice(0, 10);
          });

          if (notification.isRead === false) {
            setUnreadCount((count) => count + 1);
            
            // Play notification tone
            playNotificationSound();
            
            // Show brief toast popup
            setToastNotification(notification);
            setTimeout(() => {
              setToastNotification((current) => 
                current?.id === notification.id ? null : current
              );
            }, 5000);
          }
        } catch (err) {
          console.error("Failed to parse notification stream event", err);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();

        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(connectSSE, 5000);
        }
      };

      eventSourceRef.current = eventSource;
    };

    connectSSE();

    return () => {
      shouldReconnectRef.current = false;
      eventSourceRef.current?.close();

      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [loadNotifications, loadUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        const updatedNotification = await notificationService.markAsRead(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, isRead: updatedNotification?.isRead ?? true }
              : item
          )
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (err) {
        console.error("Failed to mark notification as read", err);
        setError("Unable to update notification.");
      }
    }

    if (isMessageNotification(notification)) {
      const convId = getNotificationConversationId(notification);
      if (convId) {
        openConversation(convId);
        setIsOpen(false);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
      setError("Unable to update notifications.");
    }
  };

  const handleToastClick = async () => {
    if (!toastNotification) return;

    const notification = toastNotification;
    setToastNotification(null);

    if (!notification.isRead) {
      try {
        const updatedNotification = await notificationService.markAsRead(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, isRead: updatedNotification?.isRead ?? true }
              : item
          )
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }

    if (isMessageNotification(notification)) {
      const convId = getNotificationConversationId(notification);
      if (convId) {
        openConversation(convId);
      }
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-ruin-border bg-ruin-card text-ruin-text transition-colors hover:bg-ruin-background"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-ruin-border bg-ruin-card shadow-xl">
          <div className="flex items-center justify-between border-b border-ruin-border px-4 py-3">
            <h2 className="font-heading text-sm font-semibold text-ruin-text">Notifications</h2>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs font-semibold text-ruin-orange transition-colors hover:text-ruin-magenta disabled:cursor-not-allowed disabled:text-ruin-muted"
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-ruin-muted">Loading...</p>
            ) : error ? (
              <p className="px-4 py-6 text-center text-sm text-ruin-magenta">{error}</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ruin-muted">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`block w-full border-b border-ruin-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-ruin-background ${
                    notification.isRead ? "bg-ruin-card" : "bg-ruin-orange/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-ruin-text">{notification.title}</p>
                    <span className="shrink-0 text-xs text-ruin-muted">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-ruin-muted">{notification.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {toastNotification && createPortal(
        <div 
          onClick={handleToastClick}
          className="fixed bottom-6 right-6 z-[100] w-80 rounded-xl border border-ruin-border bg-ruin-card shadow-2xl p-4 transition-all duration-300 cursor-pointer hover:bg-ruin-background/80"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-heading text-sm font-semibold text-ruin-text">
                {toastNotification.title}
              </h3>
              <p className="mt-1 text-sm leading-5 text-ruin-muted line-clamp-2">
                {toastNotification.message}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setToastNotification(null);
              }}
              className="shrink-0 text-ruin-muted transition-colors hover:text-ruin-text"
              aria-label="Close notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
