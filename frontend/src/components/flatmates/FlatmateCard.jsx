import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { Home } from "lucide-react";

export default function FlatmateCard({ listing, index, isOwnPost = false }) {
  const accent = listing.status === "open" ? "#00C9A7" : "#FF2D6F";
  const [isHovered, setIsHovered] = useState(false);

  const postedAt = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : "";

  return (
    <article
      className="gig-card-enter rounded-xl border bg-ruin-card transition duration-200 ease-out flex flex-col h-full overflow-hidden"
      style={{
        animationDelay: `${index * 60}ms`,
        borderColor: isHovered ? `${accent}4D` : "#2A2A2A",
        borderLeftColor: isOwnPost ? "#F26522" : isHovered ? `${accent}4D` : "#2A2A2A",
        borderLeftWidth: isOwnPost ? "2px" : undefined,
        transform: isHovered ? "translateY(-3px)" : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative h-48 flex items-center justify-center border-b ${listing.imageUrls && listing.imageUrls.length > 0 ? "bg-ruin-background border-ruin-border" : "bg-ruin-card/40 border-ruin-border border-dashed"}`}>
          {listing.imageUrls && listing.imageUrls.length > 0 ? (
              <>
                  <img src={listing.imageUrls[0]} alt={listing.title} className="h-full w-full object-contain" />
                  {listing.imageUrls.length > 1 && (
                      <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          1 / {listing.imageUrls.length} 📷
                      </div>
                  )}
              </>
          ) : (
              <Home size={48} className="text-ruin-muted/50" />
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
          
          <p className="mt-2 text-sm text-ruin-muted line-clamp-3 flex-1">
            {listing.location}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <p className="font-heading text-2xl font-bold tracking-[0.02em] text-ruin-text">
              ₹{listing.rentPerMonth}<span className="text-sm font-normal text-ruin-muted">/mo</span>
            </p>
            <span className="text-xs font-medium uppercase text-ruin-muted border border-ruin-border px-2 py-1 rounded">
                Pref: {listing.genderPreference}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Avatar name={listing.poster?.fullName || "User"} accent={accent} />
            <p className="text-sm text-ruin-muted">{listing.poster?.fullName || "User"}</p>
          </div>

          <Link
            to={`/flatmates/${listing.id}`}
            className="mt-5 w-full rounded-lg border px-4 py-3 font-heading text-sm font-semibold text-center block transition-colors"
            style={{
              borderColor: isHovered ? accent : "#3A3A3A",
              color: isHovered ? accent : "#F0EDE6",
              backgroundColor: isHovered ? `${accent}1A` : "rgba(255, 255, 255, 0.05)",
            }}
          >
            View Listing
          </Link>
      </div>
    </article>
  );
}
