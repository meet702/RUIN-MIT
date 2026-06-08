import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GigFilters from "../components/gigs/GigFilters";
import GigCard from "../components/gigs/GigCard";
import PostGigModal from "../components/gigs/PostGigModal";
import ListingSections from "../components/listings/ListingSections";
import Button from "../components/ui/Button";
import { useGigs } from "../hooks/useGigs";
import { useAuth } from "../context/AuthContext";
import { getCurrentUserId } from "../utils/ownership";

export default function GigBoardPage() {
  const { gigs, selectedStatus, selectStatus, addGig, isExiting, isLoading } = useGigs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId(user);

  const handlePostClick = () => {
    if (!isAuthenticated) {
        navigate("/login", { state: { from: { pathname: "/gigs" } } });
        return;
    }
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-ruin-background px-4 py-8 font-body text-ruin-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-5xl font-bold leading-none text-ruin-text sm:text-6xl lg:text-7xl">
              The Gig Board
            </h1>
            <p className="mt-4 text-base text-ruin-muted sm:text-lg">Post work. Get paid. Get it done.</p>
          </div>

          <Button className="sm:mt-2" onClick={handlePostClick}>
            + Post a Gig
          </Button>
        </header>

        <GigFilters selectedStatus={selectedStatus} onSelectStatus={selectStatus} />
        
        {isLoading ? (
            <div className="mt-12 text-center text-ruin-muted">Loading gigs...</div>
        ) : gigs.length === 0 ? (
            <div className="mt-12 text-center p-12 border border-ruin-border rounded-xl bg-ruin-card/50 text-ruin-muted">
                No gigs found in this category.
            </div>
        ) : (
            <div className={isExiting ? "gig-grid-exit" : ""}>
              <ListingSections
                items={gigs}
                currentUserId={currentUserId}
                gridClassName="grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3"
                renderCard={(gig, index, isOwnPost) => (
                  <GigCard key={gig.id} gig={gig} index={index} isOwnPost={isOwnPost} />
                )}
              />
            </div>
        )}
      </div>

      <PostGigModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addGig}
      />
    </main>
  );
}
