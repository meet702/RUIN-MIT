import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import DatePickerField from "../ui/DatePickerField";

const initialForm = {
  title: "",
  description: "",
  location: "",
  rentPerMonth: "",
  availableFrom: "",
  genderPreference: "any",
  amenities: "",
};

export default function PostFlatmateModal({ open, onClose, onSubmit }) {
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
        setError("You must be logged in to post a listing");
        return;
    }

    setIsLoading(true);
    setError("");

    const formattedData = {
        ...form,
        rentPerMonth: parseFloat(form.rentPerMonth)
    };

    const result = await onSubmit(formattedData);
    if (result && result.success) {
        closeModal();
    } else {
        setError(result?.message || "Failed to create listing");
    }
    
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
    >
      <form
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8 ${
          isClosing ? "modal-exit" : "modal-enter"
        }`}
        onSubmit={handleSubmit}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ruin-text">Find a Flatmate</h2>
            <p className="mt-1 text-sm text-ruin-muted">List your vacant room or flat.</p>
          </div>
          <Button variant="ghost" className="-mr-2 -mt-2" onClick={closeModal} aria-label="Close modal">
            Close
          </Button>
        </div>

        {error && (
            <div className="mb-4 rounded bg-ruin-magenta/10 p-3 text-sm text-ruin-magenta">{error}</div>
        )}

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Title</span>
            <input
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              placeholder="1 Room available in 3BHK"
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
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Location (Address/Area)</span>
            <input
              required
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              placeholder="Near MIT Campus, Kothrud"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-ruin-text">Rent (₹/mo)</span>
              <input
                required
                type="number"
                min="0"
                value={form.rentPerMonth}
                onChange={(e) => updateField("rentPerMonth", e.target.value)}
                className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              />
            </label>
            <DatePickerField
              required
              label="Available From"
              value={form.availableFrom}
              align="right"
              onChange={(value) => updateField("availableFrom", value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-ruin-text">Gender Preference</span>
              <select
                value={form.genderPreference}
                onChange={(e) => updateField("genderPreference", e.target.value)}
                className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>
          
          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Amenities (comma separated)</span>
            <input
              value={form.amenities}
              onChange={(e) => updateField("amenities", e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              placeholder="WiFi, AC, Washing Machine"
            />
          </label>
        </div>

        <Button type="submit" className="mt-7 w-full" disabled={isLoading}>
          {isLoading ? "Posting..." : "Post Listing"}
        </Button>
      </form>
    </div>
  );
}
