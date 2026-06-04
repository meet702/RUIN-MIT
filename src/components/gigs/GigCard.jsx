import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import GigBadge from "./GigBadge";

export default function GigCard({ gig, index }) {
  const accent = "#00C9A7"; // Default accent
  const [isHovered, setIsHovered] = useState(false);

  const formattedDeadline = gig.deadline ? new Date(gig.deadline).toLocaleDateString() : "Flexible";
  const postedAt = gig.createdAt ? new Date(gig.createdAt).toLocaleDateString() : "";

  return (
    <article
      className="gig-card-enter rounded-xl border bg-ruin-card p-5 transition duration-200 ease-out flex flex-col h-full"
      style={{
        animationDelay: `${index * 60}ms`,
        borderColor: isHovered ? `${accent}4D` : "#2A2A2A",
        transform: isHovered ? "translateY(-3px)" : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-4 flex justify-between items-start">
        <GigBadge status={gig.status} />
        <span className="text-xs text-ruin-muted">{postedAt}</span>
      </div>

      <h2 className="line-clamp-2 font-heading text-base font-semibold leading-6 text-ruin-text">
        {gig.title}
      </h2>
      
      <p className="mt-2 text-sm text-ruin-muted line-clamp-3 flex-1">
        {gig.description}
      </p>

      <p
        className="mt-5 font-heading text-2xl font-bold tracking-[0.02em]"
        style={{ color: accent }}
      >
        ₹{gig.budget}
      </p>

      <div className="mt-4 space-y-3 text-sm text-ruin-muted">
        <p>Deadline: {formattedDeadline}</p>
        <div className="flex items-center gap-2">
          <Avatar name={gig.posterFullName} accent={accent} />
          <p>{gig.posterFullName}</p>
        </div>
      </div>

      <Link
        to={`/gigs/${gig.id}`}
        className="gig-action mt-5 w-full rounded-lg border px-4 py-3 font-heading text-sm font-semibold text-center block"
        style={{
          "--accent": accent,
          borderColor: accent,
          color: accent,
        }}
      >
        View Details
      </Link>
    </article>
  );
}
