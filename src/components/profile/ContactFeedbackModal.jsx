import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { api } from "../../api/api";
import Button from "../ui/Button";
import ToggleGroup from "../ui/ToggleGroup";

const OPTIONS = [
  { value: "help", label: "I need help" },
  { value: "feedback", label: "I have feedback" },
  { value: "bug", label: "I found a bug" },
];

export default function ContactFeedbackModal({ open, onClose }) {
  const [selectedOption, setSelectedOption] = useState("help");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedOption("help");
      setMessage("");
      setIsSubmitting(false);
      setError("");
      setIsSent(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await api.post("/support/contact", {
        category: selectedOption,
        message,
      });

      if (response.data?.success) {
        setIsSent(true);
        setTimeout(() => onClose(), 3000);
      } else {
        setError(response.data?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[520px] rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8">
        {isSent ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00C9A7]/15">
              <CheckCircle size={36} className="text-[#00C9A7]" />
            </div>
            <h2 className="font-heading text-xl font-bold text-ruin-text">Message sent!</h2>
            <p className="text-sm text-ruin-muted">We'll get back to you soon.</p>
            <Button variant="outline" onClick={onClose} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold text-ruin-text">How can we help?</h2>
              <p className="mt-2 text-sm text-ruin-muted">Get help, share feedback, or report an issue.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-ruin-muted">Select an option</label>
                <ToggleGroup
                  options={OPTIONS}
                  value={selectedOption}
                  onChange={setSelectedOption}
                  className="flex-col sm:flex-row"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-ruin-muted">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-none rounded-xl border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text focus:border-ruin-orange focus:outline-none focus:ring-1 focus:ring-ruin-orange"
                  rows="5"
                  placeholder="Type your message here..."
                  required
                />
              </div>

              {error && (
                <p className="rounded-lg border border-ruin-magenta/30 bg-ruin-magenta/10 p-3 text-sm text-ruin-magenta">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="orange" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
