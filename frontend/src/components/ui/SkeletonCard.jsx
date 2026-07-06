/**
 * SkeletonCard — Shimmer placeholder that mirrors the shape of a listing card.
 * Renders a configurable grid of ghost cards while data is being fetched.
 *
 * @param {{ count?: number, gridClassName?: string }} props
 */
export default function SkeletonCard({ count = 6, gridClassName = "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" }) {
  return (
    <div className={`mt-10 grid items-start gap-5 ${gridClassName}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card rounded-2xl border border-ruin-border bg-ruin-card p-5 space-y-4"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {/* Badge row */}
          <div className="flex items-center justify-between">
            <div className="skeleton-shimmer h-5 w-16 rounded-full" />
            <div className="skeleton-shimmer h-4 w-20 rounded" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="skeleton-shimmer h-5 w-4/5 rounded" />
            <div className="skeleton-shimmer h-5 w-3/5 rounded" />
          </div>

          {/* Description lines */}
          <div className="space-y-2 pt-2">
            <div className="skeleton-shimmer h-3.5 w-full rounded" />
            <div className="skeleton-shimmer h-3.5 w-5/6 rounded" />
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-3 border-t border-ruin-border">
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer h-8 w-8 rounded-full" />
              <div className="skeleton-shimmer h-3.5 w-20 rounded" />
            </div>
            <div className="skeleton-shimmer h-6 w-14 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
