import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { Package } from "lucide-react";

export default function MarketplaceCard({ listing, index }) {
  const accent = listing.status === "available" ? "#00C9A7" : "#FF2D6F";
  const [isHovered, setIsHovered] = useState(false);

  const postedAt = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : "";

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
          {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
              <Package size={48} className="text-ruin-muted/50" />
          )}
      </div>

      <div className="p-5 flex flex-col flex-1">
          <div className="mb-4 flex justify-between items-start">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.04em] capitalize"
              style={{
                backgroundColor: `${accent}1A`,
                color: accent,
              }}
            >
              {listing.status}
            </span>
            <span className="text-xs text-ruin-muted">{postedAt}</span>
          </div>

          <h2 className="line-clamp-2 font-heading text-base font-semibold leading-6 text-ruin-text">
            {listing.title}
          </h2>

          <div className="mt-4 flex items-center justify-between mt-auto pt-4">
            <p className="font-heading text-2xl font-bold tracking-[0.02em] text-ruin-text">
              ₹{listing.price}
            </p>
            <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-medium uppercase text-ruin-muted border border-ruin-border px-2 py-0.5 rounded capitalize">
                    {listing.category}
                </span>
                <span className="text-[10px] font-medium uppercase text-ruin-muted border border-ruin-border px-2 py-0.5 rounded">
                    {listing.condition?.replace("_", " ")}
                </span>
            </div>
          </div>

          <Link
            to={`/marketplace/${listing.id}`}
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
