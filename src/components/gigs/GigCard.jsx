import { useState } from "react";
import { CATEGORY_ACCENTS } from "../../data/mockGigs";
import Avatar from "../ui/Avatar";
import GigBadge from "./GigBadge";

export default function GigCard({ gig, index }) {
  const accent = CATEGORY_ACCENTS[gig.category] || CATEGORY_ACCENTS.Other;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className="gig-card-enter rounded-xl border bg-ruin-card p-5 transition duration-200 ease-out"
      style={{
        animationDelay: `${index * 60}ms`,
        borderColor: isHovered ? `${accent}4D` : "#2A2A2A",
        transform: isHovered ? "translateY(-3px)" : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-4">
        <GigBadge category={gig.category} />
      </div>

      <h2 className="line-clamp-2 font-heading text-base font-semibold leading-6 text-ruin-text">
        {gig.title}
      </h2>

      <p
        className="mt-5 font-heading text-2xl font-bold tracking-[0.02em]"
        style={{ color: accent }}
      >
        ₹{gig.budget}
      </p>

      <div className="mt-4 space-y-3 text-sm text-ruin-muted">
        <p>{gig.deadline}</p>
        <div className="flex items-center gap-2">
          <Avatar name={gig.postedBy.name} accent={accent} />
          <p>
            {gig.postedBy.name} • {gig.postedBy.year} {gig.postedBy.branch}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="gig-action mt-5 w-full rounded-lg border px-4 py-3 font-heading text-sm font-semibold"
        style={{
          "--accent": accent,
          borderColor: accent,
          color: accent,
        }}
      >
        I can do this
      </button>
    </article>
  );
}
