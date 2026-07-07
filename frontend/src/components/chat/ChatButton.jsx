import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import ActionLoader from "../ui/ActionLoader";

export default function ChatButton({ otherUserId, otherUserName, referenceType, referenceId, buttonText = "Chat" }) {
  const { startAndOpenConversation } = useChat();
  const { isAuthenticated } = useAuth();
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleClick = async () => {
    if (!otherUserId || !referenceType || !referenceId) {
      return;
    }

    setIsOpeningChat(true);
    try {
      await startAndOpenConversation(otherUserId, referenceType, referenceId);
    } finally {
      setIsOpeningChat(false);
    }
  };

  return (
    <>
      {isOpeningChat && <ActionLoader message="Opening chat..." />}
      <button
        type="button"
        onClick={handleClick}
        disabled={isOpeningChat}
        title={otherUserName ? `Chat with ${otherUserName}` : "Open chat"}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-ruin-orange px-4 py-2 text-sm font-semibold text-ruin-background transition-colors hover:bg-ruin-orange/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isOpeningChat ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
        {isOpeningChat ? "Opening..." : buttonText}
      </button>
    </>
  );
}
