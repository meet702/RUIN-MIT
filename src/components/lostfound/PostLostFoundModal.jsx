import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import ImageUploader from "../common/ImageUploader";
import ToggleGroup from "../ui/ToggleGroup";
import { uploadService } from "../../api/uploadService";
import ActionLoader from "../ui/ActionLoader";

const initialForm = {
  type: "lost",
  title: "",
  description: "",
  locationFoundLost: "",
  imageUrls: [],
};

function buildForm(initialData) {
  if (!initialData) {
    return initialForm;
  }

  const urls = initialData.imageUrls || initialData.images?.map((image) => image.imageUrl) || [];
  return {
    type: initialData.type || "lost",
    title: initialData.title || "",
    description: initialData.description || "",
    locationFoundLost: initialData.locationFoundLost || "",
    imageUrls: urls,
  };
}

export default function PostLostFoundModal({ open, onClose, onSubmit, initialData = null, mode = "create" }) {
  const [form, setForm] = useState(initialForm);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  
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
      setPendingFiles([]);
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

    try {
      let finalImageUrls = [...form.imageUrls];

      if (pendingFiles.length > 0) {
        const uploadPromises = pendingFiles.map(file => uploadService.uploadFile(file));
        const newUrls = await Promise.all(uploadPromises);
        finalImageUrls = [...finalImageUrls, ...newUrls.filter(Boolean)];
      }

      const formattedData = {
          ...form,
          imageUrls: finalImageUrls,
      };

      const result = await onSubmit(formattedData);
      if (result && result.success) {
          closeModal();
      } else {
          setError(result?.message || `Failed to ${isEditing ? "update" : "create"} post`);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload one or more images. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <ActionLoader message={isEditing ? "Saving changes..." : "Posting item..."} />}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
      >
      <form
        className={`w-full max-w-[520px] max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8 ${
          isClosing ? "modal-exit" : "modal-enter"
        }`}
        onSubmit={handleSubmit}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ruin-text">{isEditing ? "Edit Lost & Found" : "Report Lost & Found"}</h2>
            <p className="mt-1 text-sm text-ruin-muted">{isEditing ? "Update the post details." : "Help reunite items with their owners."}</p>
          </div>
          <Button variant="ghost" className="-mr-2 -mt-2" onClick={closeModal} aria-label="Close modal">
            Close
          </Button>
        </div>

        {error && (
            <div className="mb-4 rounded bg-ruin-magenta/10 p-3 text-sm text-ruin-magenta">{error}</div>
        )}

        <div className="space-y-4">
          <div className="mb-6">
            <ToggleGroup
              options={[
                {
                  value: "lost",
                  label: "I Lost Something",
                },
                {
                  value: "found",
                  label: "I Found Something",
                },
              ]}
              value={form.type}
              onChange={(val) => updateField("type", val)}
            />
          </div>

          <label className="block mt-4">
            <span className="text-sm font-medium text-ruin-text">Item Name</span>
            <input
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none transition duration-200 placeholder:text-ruin-muted focus:border-ruin-orange"
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
              className="mt-2 w-full resize-none rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none transition duration-200 placeholder:text-ruin-muted focus:border-ruin-orange"
              placeholder="Brand, size, unique marks, etc."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Location (Where was it {form.type}?)</span>
            <input
              required
              value={form.locationFoundLost}
              onChange={(e) => updateField("locationFoundLost", e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none transition duration-200 placeholder:text-ruin-muted focus:border-ruin-orange"
              placeholder="Library 2nd Floor / Cafeteria"
            />
          </label>

          <div className="block">
            <span className="text-sm font-medium text-ruin-text mb-2 block">Images (Optional, max 5)</span>
            <ImageUploader
              maxFiles={5}
              currentImageUrls={form.imageUrls}
              deleteEndpoint="lostfound"
              referenceId={isEditing ? initialData.id : null}
              onUpload={(urls) => updateField("imageUrls", urls)}
              onRemove={(url) => updateField("imageUrls", form.imageUrls.filter(u => u !== url))}
              deferredUpload={true}
              onPendingFilesChange={setPendingFiles}
            />
          </div>
        </div>

        <Button type="submit" className="mt-7 w-full" disabled={isLoading} style={form.type === "found" ? { backgroundColor: "#00C9A7", color: "#111" } : {}}>
          {isLoading ? (isEditing ? "Saving..." : "Posting...") : (isEditing ? "Save Changes" : `Post ${form.type === 'lost' ? 'Lost' : 'Found'} Item`)}
        </Button>
      </form>
    </div>
    </>
  );
}
