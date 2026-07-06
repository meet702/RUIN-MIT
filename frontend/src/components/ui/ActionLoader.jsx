import { Loader2 } from "lucide-react";

export default function ActionLoader({ message = "Please wait..." }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center rounded-2xl bg-ruin-card p-6 shadow-2xl border border-ruin-border min-w-[200px]">
        <Loader2 className="h-10 w-10 animate-spin text-ruin-orange" />
        <p className="mt-4 font-heading text-base font-medium text-ruin-text">{message}</p>
      </div>
    </div>
  );
}
