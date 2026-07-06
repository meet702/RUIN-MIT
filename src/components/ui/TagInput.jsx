import { X } from "lucide-react";
import { useState } from "react";

export default function TagInput({ value = "", onChange, placeholder = "Type and press Enter" }) {
  const [inputValue, setInputValue] = useState("");

  const tags = value
    ? value.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setInputValue("");
      return;
    }
    const next = [...tags, tag].join(", ");
    onChange(next);
    setInputValue("");
  };

  const removeTag = (index) => {
    const next = tags.filter((_, i) => i !== index).join(", ");
    onChange(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="mt-2 flex min-h-[48px] flex-wrap items-center gap-1.5 rounded-lg border border-ruin-border bg-ruin-background px-3 py-2 focus-within:border-ruin-orange transition-colors">
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-ruin-orange/15 px-2.5 py-1 text-xs font-semibold text-ruin-orange"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="ml-0.5 rounded-full p-0.5 text-ruin-orange/70 hover:bg-ruin-orange/20 hover:text-ruin-orange transition-colors"
            aria-label={`Remove ${tag}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        className="min-w-[100px] flex-1 bg-transparent py-1 text-sm text-ruin-text outline-none placeholder:text-ruin-muted"
        placeholder={tags.length === 0 ? placeholder : "Add more..."}
      />
    </div>
  );
}
