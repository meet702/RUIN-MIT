import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { Search, Info } from "lucide-react";

export default function LostFoundCard({ post, index }) {
  const isLost = post.type === "lost";
  const accent = isLost ? "#F26522" : "#00C9A7"; // Orange for lost, Green for found
  const [isHovered, setIsHovered] = useState(false);

  const postedAt = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "";
  const firstImage = post.images && post.images.length > 0 ? post.images[0].imageUrl : null;

  return (
    <article
      className="gig-card-enter rounded-xl border bg-ruin-card transition duration-200 ease-out flex flex-col h-full overflow-hidden"
      style={{
        animationDelay: `${index * 60}ms`,
        borderColor: isHovered ? `${accent}4D` : "#2A2A2A",
        transform: isHovered ? "translateY(-3px)" : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-48 bg-ruin-background flex items-center justify-center border-b border-ruin-border">
          {firstImage ? (
              <img src={firstImage} alt={post.title} className="w-full h-full object-cover" />
          ) : isLost ? (
              <Search size={48} className="text-ruin-muted/50" />
          ) : (
              <Info size={48} className="text-ruin-muted/50" />
          )}
      </div>

      <div className="p-5 flex flex-col flex-1">
          <div className="mb-4 flex justify-between items-start">
            <div className="flex gap-2">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.04em] uppercase"
                  style={{ backgroundColor: `${accent}1A`, color: accent }}
                >
                  {post.type}
                </span>
                {post.status !== "open" && (
                    <span className="inline-flex items-center rounded-full px-2 py-1 font-heading text-[10px] font-semibold uppercase bg-ruin-background border border-ruin-border text-ruin-muted">
                        Resolved
                    </span>
                )}
            </div>
            <span className="text-xs text-ruin-muted">{postedAt}</span>
          </div>

          <h2 className="line-clamp-2 font-heading text-base font-semibold leading-6 text-ruin-text">
            {post.title}
          </h2>

          <p className="mt-2 text-sm text-ruin-muted line-clamp-2 flex-1">
            {post.locationFoundLost}
          </p>

          <div className="mt-4 flex items-center gap-2 pt-4 border-t border-ruin-border mt-auto">
            <Avatar name={post.posterFullName} accent={accent} />
            <p className="text-sm text-ruin-muted line-clamp-1">{post.posterFullName}</p>
          </div>

          <Link
            to={`/lost-found/${post.id}`}
            className="mt-5 w-full rounded-lg border px-4 py-3 font-heading text-sm font-semibold text-center block transition-colors"
            style={{
              borderColor: isHovered ? accent : "#2A2A2A",
              color: isHovered ? accent : "#E5E5E5",
              backgroundColor: isHovered ? `${accent}0A` : "transparent",
            }}
          >
            View Details
          </Link>
      </div>
    </article>
  );
}
