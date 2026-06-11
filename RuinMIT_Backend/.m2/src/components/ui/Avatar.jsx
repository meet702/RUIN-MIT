export default function Avatar({ name, accent = "#F26522" }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-heading font-semibold"
      style={{
        borderColor: `${accent}66`,
        backgroundColor: `${accent}1A`,
        color: accent,
      }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
