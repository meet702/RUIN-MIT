/**
 * PageLoader — Full-page branded loading overlay.
 * Shows a pulsing "R" logo with an animated progress ring,
 * used during auth checks and heavy route transitions.
 */
export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ruin-background">
      {/* Subtle radial glow behind the logo */}
      <div className="absolute w-64 h-64 rounded-full bg-ruin-orange/5 blur-3xl animate-pulse" />

      <div className="relative flex flex-col items-center gap-6">
        {/* Spinning ring */}
        <div className="relative w-20 h-20">
          <svg className="page-loader-ring w-20 h-20" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="#2A2A2A"
              strokeWidth="4"
            />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="#F26522"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="160"
              strokeDashoffset="120"
              className="page-loader-arc"
            />
          </svg>
          {/* Centre letter */}
          <span className="absolute inset-0 flex items-center justify-center font-heading text-2xl font-bold text-ruin-orange page-loader-pulse">
            R
          </span>
        </div>

        {/* Shimmer dots */}
        <div className="flex gap-1.5">
          <span className="page-loader-dot w-1.5 h-1.5 rounded-full bg-ruin-orange/60" style={{ animationDelay: "0ms" }} />
          <span className="page-loader-dot w-1.5 h-1.5 rounded-full bg-ruin-orange/60" style={{ animationDelay: "150ms" }} />
          <span className="page-loader-dot w-1.5 h-1.5 rounded-full bg-ruin-orange/60" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
