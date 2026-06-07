import { MessageCircle } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

export default function ChatButton({ otherUserId, otherUserName, referenceType, referenceId, buttonText = "Chat" }) {
  const { startAndOpenConversation } = useChat();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const handleClick = async () => {
    if (!otherUserId || !referenceType || !referenceId) {
      return;
    }

    await startAndOpenConversation(otherUserId, referenceType, referenceId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={otherUserName ? `Chat with ${otherUserName}` : "Open chat"}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-ruin-orange px-4 py-2 text-sm font-semibold text-ruin-background transition-colors hover:bg-ruin-orange/90"
    >
      <MessageCircle size={16} />
      {buttonText}
    </button>
  );
}
