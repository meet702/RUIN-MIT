import { useNavigate } from "react-router-dom";

export default function DetailPageLayout({
  onBack,
  headerActions,
  heroImage,
  badges,
  postedAt,
  title,
  mainContent,
  sidebarContent,
  bottomContent
}) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 font-body">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={handleBack} className="text-ruin-muted hover:text-ruin-text transition-colors">
          &larr; Back
        </button>
        {headerActions && (
          <div className="flex gap-2">
            {headerActions}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-ruin-border bg-ruin-card overflow-hidden">
        {heroImage}

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            {badges && (
              <div className="flex gap-2">
                {badges}
              </div>
            )}
            {postedAt && (
              <span className="text-sm text-ruin-muted">Posted {postedAt}</span>
            )}
          </div>

          <h1 className="font-heading text-3xl font-bold text-ruin-text md:text-4xl">{title}</h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {mainContent}
            </div>

            <div className="space-y-6">
                {sidebarContent}
            </div>
          </div>
        </div>
      </div>
      
      {bottomContent && (
        <div className="mt-8">
            {bottomContent}
        </div>
      )}
    </div>
  );
}
