import { Search } from "lucide-react";
import Button from "./Button";

export default function EmptyState({ 
  icon: Icon = Search, 
  title = "No items found", 
  description = "Check back later or try adjusting your filters.",
  actionLabel,
  onAction
}) {
  return (
    <div className="mt-12 flex flex-col items-center justify-center p-12 text-center rounded-xl border border-ruin-border border-dashed bg-ruin-card/20">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ruin-card border border-ruin-border shadow-sm">
        <Icon size={28} className="text-ruin-muted" />
      </div>
      <h3 className="font-heading text-xl font-bold text-ruin-text mb-2">{title}</h3>
      <p className="text-ruin-muted mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="orange" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
