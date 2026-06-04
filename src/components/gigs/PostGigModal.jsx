import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import DatePickerField from "../ui/DatePickerField";
import TimePickerField from "../ui/TimePickerField";

const initialForm = {
  title: "",
  description: "",
  budget: "",
  deadlineDate: "",
  deadlineTime: "",
};

export default function PostGigModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  if (!open) {
    return null;
  }

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function closeModal() {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      setError("");
      setForm(initialForm);
      onClose();
    }, 250);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isAuthenticated) {
        setError("You must be logged in to post a gig");
        return;
    }

    setIsLoading(true);
    setError("");

    const { deadlineDate, deadlineTime, ...gigFields } = form;
    const formattedData = {
        ...gigFields,
        deadline: deadlineDate && deadlineTime ? `${deadlineDate}T${deadlineTime}` : null,
        budget: form.budget ? parseFloat(form.budget) : null
    };

    const result = await onSubmit(formattedData);
    if (result && result.success) {
        closeModal();
    } else {
        setError(result?.message || "Failed to create gig");
    }
    
    setIsLoading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <form
        className={`w-full max-w-[520px] rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8 ${
          isClosing ? "modal-exit" : "modal-enter"
        }`}
        onSubmit={handleSubmit}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ruin-text">Post a Gig</h2>
            <p className="mt-1 text-sm text-ruin-muted">Put the task on the board.</p>
          </div>
          <Button variant="ghost" className="-mr-2 -mt-2" onClick={closeModal} aria-label="Close modal">
            Close
          </Button>
        </div>

        {error && (
            <div className="mb-4 rounded bg-ruin-magenta/10 p-3 text-sm text-ruin-magenta">
                {error}
            </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-ruin-text">Gig title</span>
          <input
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none transition duration-200 placeholder:text-ruin-muted focus:border-ruin-orange"
            placeholder="Need my DBMS assignment done by tomorrow"
          />
        </label>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-ruin-text">Description</span>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="mt-2 w-full resize-none rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none transition duration-200 placeholder:text-ruin-muted focus:border-ruin-orange"
            placeholder="Mention pages, files, diagrams, formatting, or anything important."
          />
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Budget in ₹</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-heading font-semibold text-ruin-muted">
                ₹
              </span>
              <input
                min="0"
                type="number"
                value={form.budget}
                onChange={(event) => updateField("budget", event.target.value)}
                className="w-full rounded-lg border border-ruin-border bg-ruin-background py-3 pl-9 pr-4 font-heading font-semibold tracking-[0.02em] text-ruin-text outline-none transition duration-200 placeholder:text-ruin-muted focus:border-ruin-orange"
                placeholder="200"
              />
            </div>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <DatePickerField
              label="Deadline Date"
              value={form.deadlineDate}
              align="right"
              onChange={(value) => updateField("deadlineDate", value)}
            />
            <TimePickerField
              label="Deadline Time"
              value={form.deadlineTime}
              align="right"
              onChange={(value) => updateField("deadlineTime", value)}
            />
          </div>
        </div>

        <Button type="submit" className="mt-7 w-full" disabled={isLoading}>
          {isLoading ? "Posting..." : "Post Gig"}
        </Button>
      </form>
    </div>
  );
}
