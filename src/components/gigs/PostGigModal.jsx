import { useEffect, useState } from "react";
import { GIG_CATEGORIES } from "../../data/mockGigs";
import Button from "../ui/Button";
import Tag from "../ui/Tag";

const initialForm = {
  title: "",
  category: "Assignments",
  description: "",
  budget: "",
  deadline: "",
};

export default function PostGigModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [isClosing, setIsClosing] = useState(false);

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
      onClose();
    }, 250);
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit(form);
    setForm(initialForm);
    closeModal();
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

        <div className="mt-5">
          <p className="text-sm font-medium text-ruin-text">Category</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GIG_CATEGORIES.map((category) => (
              <Tag
                key={category}
                active={form.category === category}
                onClick={() => updateField("category", category)}
              >
                {category}
              </Tag>
            ))}
          </div>
        </div>

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
                required
                min="1"
                type="number"
                value={form.budget}
                onChange={(event) => updateField("budget", event.target.value)}
                className="w-full rounded-lg border border-ruin-border bg-ruin-background py-3 pl-9 pr-4 font-heading font-semibold tracking-[0.02em] text-ruin-text outline-none transition duration-200 placeholder:text-ruin-muted focus:border-ruin-orange"
                placeholder="200"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Deadline</span>
            <input
              required
              type="date"
              value={form.deadline}
              onChange={(event) => updateField("deadline", event.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none transition duration-200 focus:border-ruin-orange"
            />
          </label>
        </div>

        <Button type="submit" className="mt-7 w-full">
          Post Gig
        </Button>
      </form>
    </div>
  );
}
