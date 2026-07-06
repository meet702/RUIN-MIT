export default function CurrencyInput({ value, onChange, placeholder = "0", required = false, min = "0", error = false }) {
  return (
    <div className="relative mt-2">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-heading font-semibold text-ruin-muted">
        ₹
      </span>
      <input
        type="number"
        min={min}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border bg-ruin-background py-3 pl-9 pr-4 font-heading font-semibold tracking-[0.02em] text-ruin-text outline-none transition duration-200 placeholder:text-ruin-muted focus:border-ruin-orange ${
          error ? "border-ruin-magenta" : "border-ruin-border"
        }`}
        placeholder={placeholder}
      />
    </div>
  );
}
