import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["books", "electronics", "cycles", "stationery", "clothing", "furniture", "other"];
const CONDITIONS = ["new", "like_new", "good", "fair"];

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "other",
  condition: "good",
  imageUrl: "",
};

function buildForm(initialData) {
  if (!initialData) {
    return initialForm;
  }

  return {
    title: initialData.title || "",
    description: initialData.description || "",
    price: initialData.price ?? "",
    category: initialData.category || "other",
    condition: initialData.condition || "good",
    imageUrl: initialData.imageUrl || "",
  };
}

export default function PostMarketplaceModal({ open, onClose, onSubmit, initialData = null, mode = "create" }) {
  const [form, setForm] = useState(initialForm);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const isEditing = mode === "edit";

  useEffect(() => {
    if (open) {
      setForm(buildForm(initialData));
      setError("");
    }
  }, [open, initialData]);

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
      setForm(buildForm(initialData));
      onClose();
    }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
        setError("You must be logged in to post an item");
        return;
    }

    setIsLoading(true);
    setError("");

    const formattedData = {
        ...form,
        price: parseFloat(form.price)
    };

    const result = await onSubmit(formattedData);
    if (result && result.success) {
        closeModal();
    } else {
        setError(result?.message || `Failed to ${isEditing ? "update" : "create"} listing`);
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
            <h2 className="font-heading text-2xl font-bold text-ruin-text">{isEditing ? "Edit Item" : "Sell an Item"}</h2>
            <p className="mt-1 text-sm text-ruin-muted">{isEditing ? "Update the listing details." : "List your used items for sale on campus."}</p>
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
              placeholder="Engineering Mathematics Textbook"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="mt-2 w-full resize-none rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Price (₹)</span>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              placeholder="500"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-ruin-text">Category</span>
              <select
                required
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange capitalize"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ruin-text">Condition</span>
              <select
                required
                value={form.condition}
                onChange={(e) => updateField("condition", e.target.value)}
                className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange capitalize"
              >
                {CONDITIONS.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Image URL (Optional)</span>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => updateField("imageUrl", e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              placeholder="https://example.com/image.jpg"
            />
          </label>
        </div>

        <Button type="submit" className="mt-7 w-full" disabled={isLoading}>
          {isLoading ? (isEditing ? "Saving..." : "Posting...") : (isEditing ? "Save Changes" : "Post Item")}
        </Button>
      </form>
    </div>
  );
}
