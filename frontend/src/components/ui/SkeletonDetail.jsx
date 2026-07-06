/**
 * SkeletonDetail — Shimmer placeholder for detail pages.
 * Mirrors the common detail page layout: back button area, main card with
 * a 2/3 + 1/3 grid, title, description lines, and a sidebar panel.
 */
export default function SkeletonDetail() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 font-body animate-fade-in">
      {/* Back button row */}
      <div className="mb-6 flex items-center justify-between">
        <div className="skeleton-shimmer h-4 w-16 rounded" />
        <div className="flex gap-2">
          <div className="skeleton-shimmer h-7 w-14 rounded-md" />
          <div className="skeleton-shimmer h-7 w-24 rounded-md" />
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-ruin-border bg-ruin-card overflow-hidden">
        {/* Image placeholder */}
        <div className="skeleton-shimmer w-full h-48 md:h-64" />

        <div className="p-6 sm:p-8">
          {/* Badge + date */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="skeleton-shimmer h-6 w-20 rounded-full" />
            <div className="skeleton-shimmer h-4 w-28 rounded" />
          </div>

          {/* Title */}
          <div className="skeleton-shimmer h-8 w-3/4 rounded mb-2" />
          <div className="skeleton-shimmer h-5 w-1/3 rounded mb-8" />

          {/* Content grid: 2 cols + sidebar */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Left 2/3 */}
            <div className="md:col-span-2 space-y-6">
              {/* Description section */}
              <div>
                <div className="skeleton-shimmer h-3 w-24 rounded mb-3" />
                <div className="space-y-2">
                  <div className="skeleton-shimmer h-4 w-full rounded" />
                  <div className="skeleton-shimmer h-4 w-full rounded" />
                  <div className="skeleton-shimmer h-4 w-5/6 rounded" />
                  <div className="skeleton-shimmer h-4 w-4/6 rounded" />
                </div>
              </div>

              {/* Posted by section */}
              <div className="pt-4 border-t border-ruin-border">
                <div className="skeleton-shimmer h-3 w-20 rounded mb-3" />
                <div className="flex items-center gap-3">
                  <div className="skeleton-shimmer h-10 w-10 rounded-full" />
                  <div className="skeleton-shimmer h-4 w-28 rounded" />
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-5 rounded-xl border border-ruin-border bg-ruin-background p-5">
              <div>
                <div className="skeleton-shimmer h-3 w-16 rounded mb-2" />
                <div className="skeleton-shimmer h-9 w-24 rounded" />
              </div>
              <div>
                <div className="skeleton-shimmer h-3 w-20 rounded mb-2" />
                <div className="skeleton-shimmer h-5 w-28 rounded" />
              </div>
              <div className="pt-4 border-t border-ruin-border">
                <div className="skeleton-shimmer h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
