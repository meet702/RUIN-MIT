import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  type: "lost",
  title: "",
  description: "",
  locationFoundLost: "",
  imageUrls: "",
};

export default function PostLostFoundModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const handleEscape = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  if (!open) return null;

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setError("");
      setForm(initialForm);
      onClose();
    }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
        setError("You must be logged in to post");
        return;
    }

    setIsLoading(true);
    setError("");

    const formattedData = {
        ...form,
        imageUrls: form.imageUrls.split(",").map(url => url.trim()).filter(url => url)
    };

    const result = await onSubmit(formattedData);
    if (result && result.success) {
        closeModal();
    } else {
        setError(result?.message || "Failed to create post");
    }
    
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
    >
      <form
        className={`w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8 ${
          isClosing ? "modal-exit" : "modal-enter"
        }`}
        onSubmit={handleSubmit}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ruin-text">Report Lost & Found</h2>
            <p className="mt-1 text-sm text-ruin-muted">Help reunite items with their owners.</p>
          </div>
          <Button variant="ghost" className="-mr-2 -mt-2" onClick={closeModal} aria-label="Close modal">
            Close
          </Button>
        </div>

        {error && (
            <div className="mb-4 rounded bg-ruin-magenta/10 p-3 text-sm text-ruin-magenta">{error}</div>
        )}

        <div className="space-y-4">
          <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="lost" 
                    checked={form.type === "lost"}
                    onChange={(e) => updateField("type", e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-center font-medium text-ruin-muted peer-checked:border-ruin-orange peer-checked:text-ruin-orange transition-colors">
                      I Lost Something
                  </div>
              </label>
              <label className="flex-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="found" 
                    checked={form.type === "found"}
                    onChange={(e) => updateField("type", e.target.value)}
                    className="peer sr-only"
                  />
                  <div className="rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-center font-medium text-ruin-muted peer-checked:border-[#00C9A7] peer-checked:text-[#00C9A7] transition-colors">
                      I Found Something
                  </div>
              </label>
          </div>

          <label className="block mt-4">
            <span className="text-sm font-medium text-ruin-text">Item Name</span>
            <input
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              placeholder="Black Water Bottle"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Description</span>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="mt-2 w-full resize-none rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              placeholder="Brand, size, unique marks, etc."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Location (Where was it {form.type}?)</span>
            <input
              required
              value={form.locationFoundLost}
              onChange={(e) => updateField("locationFoundLost", e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              placeholder="Library 2nd Floor / Cafeteria"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Image URLs (comma separated, optional)</span>
            <input
              value={form.imageUrls}
              onChange={(e) => updateField("imageUrls", e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              placeholder="https://example.com/img1.jpg, https://..."
            />
          </label>
        </div>

        <Button type="submit" className="mt-7 w-full" disabled={isLoading} style={form.type === "found" ? { backgroundColor: "#00C9A7", color: "#111" } : {}}>
          {isLoading ? "Posting..." : `Post ${form.type === 'lost' ? 'Lost' : 'Found'} Item`}
        </Button>
      </form>
    </div>
  );
}
