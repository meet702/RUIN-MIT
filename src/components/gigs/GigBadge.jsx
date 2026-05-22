import { CATEGORY_ACCENTS } from "../../data/mockGigs";

export default function GigBadge({ category }) {
  const accent = CATEGORY_ACCENTS[category] || CATEGORY_ACCENTS.Other;

  return (
    <span
      className="inline-flex rotate-[-1.5deg] items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.04em]"
      style={{
        backgroundColor: `${accent}1A`,
        color: accent,
      }}
    >
      {category}
    </span>
  );
}
