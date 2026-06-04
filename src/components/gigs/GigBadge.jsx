export default function GigBadge({ status }) {
  const accent = status === "open" ? "#00C9A7" : status === "completed" ? "#A78BFA" : status === "cancelled" ? "#FF2D6F" : "#F26522";
  const displayStatus = status ? status.replace("_", " ") : "unknown";

  return (
    <span
      className="inline-flex rotate-[-1.5deg] items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.04em] capitalize"
      style={{
        backgroundColor: `${accent}1A`,
        color: accent,
      }}
    >
      {displayStatus}
    </span>
  );
}
