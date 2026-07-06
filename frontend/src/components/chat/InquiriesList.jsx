import Avatar from "../ui/Avatar";
import ChatButton from "./ChatButton";

export default function InquiriesList({ inquiries, title = "Inquiries", referenceType, referenceId, emptyMessage = "No inquiries yet." }) {
  if (!inquiries) return null;

  return (
    <>
      <h2 className="font-heading text-2xl font-bold text-ruin-text mb-4">{title} ({inquiries.length})</h2>
      {inquiries.length === 0 ? (
        <p className="text-ruin-muted">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const senderId = inq.sender?.id || inq.senderId || inq.applicantId;
            const senderName = inq.sender?.fullName || inq.inquirerFullName || inq.applicantFullName || "User";
            const dateStr = inq.createdAt ? new Date(inq.createdAt).toLocaleString() : "";
            
            return (
                <div key={inq.id} className="rounded-xl border border-ruin-border bg-ruin-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar name={senderName} />
                        <div>
                            <span className="text-ruin-text font-medium block">{senderName}</span>
                            <span className="text-xs text-ruin-muted">{dateStr}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            {inq.customActions && inq.customActions}
                            <ChatButton
                                otherUserId={senderId}
                                otherUserName={senderName}
                                referenceType={referenceType}
                                referenceId={referenceId}
                                buttonText="Chat"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-ruin-text whitespace-pre-wrap">{inq.message}</p>
                </div>
            );
          })}
        </div>
      )}
    </>
  );
}
