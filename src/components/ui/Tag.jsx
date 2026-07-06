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
      className={`shrink-0 rounded-full px-4 py-2 font-heading text-xs font-semibold tracking-[0.04em] transition duration-200 ease-out ${
        active
          ? "bg-ruin-orange text-ruin-background shadow-sm"
          : "bg-transparent text-ruin-muted hover:text-ruin-text hover:bg-white/5"
      } ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
