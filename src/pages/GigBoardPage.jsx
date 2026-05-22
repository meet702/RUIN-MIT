import { useState } from "react";
import GigFilters from "../components/gigs/GigFilters";
import GigGrid from "../components/gigs/GigGrid";
import PostGigModal from "../components/gigs/PostGigModal";
import Button from "../components/ui/Button";
import { useGigs } from "../hooks/useGigs";

export default function GigBoardPage() {
  const { gigs, selectedCategory, selectCategory, addGig, isExiting } = useGigs();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

          <Button className="sm:mt-2" onClick={() => setIsModalOpen(true)}>
            + Post a Gig
          </Button>
        </header>

        <GigFilters selectedCategory={selectedCategory} onSelectCategory={selectCategory} />
        <GigGrid gigs={gigs} isExiting={isExiting} />
      </div>

      <PostGigModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addGig}
      />
    </main>
  );
}
