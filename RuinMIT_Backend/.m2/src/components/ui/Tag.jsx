export default function Tag({
  children,
  active = false,
  className = "",
  style,
  ...props
}) {
  return (
    <button
      type="button"
      className={`shrink-0 snap-start rounded-full border px-4 py-2 font-heading text-xs font-semibold tracking-[0.04em] transition duration-200 ease-out ${
        active
          ? "border-ruin-orange bg-ruin-orange text-ruin-background"
          : "border-ruin-border bg-transparent text-ruin-muted hover:text-ruin-text"
      } ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
