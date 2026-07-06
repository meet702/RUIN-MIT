export default function FilterPillGroup({ children, className = "" }) {
  return (
    <div className={`-mx-4 mt-10 overflow-x-auto px-4 sm:mx-0 sm:px-0 ${className}`}>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 p-1 backdrop-blur-sm border border-ruin-border/50">
        {children}
      </div>
    </div>
  );
}
