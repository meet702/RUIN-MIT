const baseClasses =
  "inline-flex items-center justify-center rounded-lg border font-heading text-sm font-semibold transition ease-out disabled:pointer-events-none disabled:opacity-50";

const variants = {
  orange:
    "border-[2px] border-ruin-orange bg-ruin-orange px-5 py-3 text-ruin-background duration-150 hover:scale-[1.03]",
  outline:
    "border-ruin-border bg-transparent px-4 py-3 text-ruin-text duration-200",
  ghost:
    "border-transparent bg-transparent px-3 py-2 text-ruin-muted duration-150 hover:text-ruin-text",
};

export default function Button({
  children,
  className = "",
  type = "button",
  variant = "orange",
  ...props
}) {
  return (
    <button type={type} className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
