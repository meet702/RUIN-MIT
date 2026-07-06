export default function ToggleGroup({ options, value, onChange, className = "" }) {
  return (
    <div className={`flex gap-4 ${className}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <label key={option.value} className="flex-1 cursor-pointer">
            <input
              type="radio"
              name={option.name || "toggle"}
              value={option.value}
              checked={isActive}
              onChange={(e) => onChange(e.target.value)}
              className="peer sr-only"
            />
            <div
              className={`h-full rounded-xl border px-4 py-3 text-center transition-colors ${
                isActive
                  ? "border-ruin-orange bg-ruin-orange text-ruin-background shadow-sm"
                  : "border-ruin-border bg-transparent text-ruin-muted hover:text-ruin-text"
              }`}
            >
              <span className="block font-heading text-sm font-bold">{option.label}</span>
              {option.description && (
                <span className="mt-1 block text-xs leading-snug opacity-90">{option.description}</span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
