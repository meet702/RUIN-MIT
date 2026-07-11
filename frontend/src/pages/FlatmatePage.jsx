import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { flatmateService } from "../api/flatmateService";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import FlatmateCard from "../components/flatmates/FlatmateCard";
import PostFlatmateModal from "../components/flatmates/PostFlatmateModal";
import ListingSections from "../components/listings/ListingSections";
import { getCurrentUserId, isOwnPost } from "../utils/ownership";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";
import { Home } from "lucide-react";

export default function FlatmatePage() {
  const [listings, setListings] = useState([]);
  const [closedListings, setClosedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId(user);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const [openResponse, closedResponse] = await Promise.all([
        flatmateService.getListings("open", null, 0, 50),
        isAuthenticated ? flatmateService.getListings("closed", null, 0, 50) : Promise.resolve(null),
      ]);
      if (openResponse.success) {
        setListings(openResponse.data.content || []);
      }
      if (closedResponse?.success) {
        setClosedListings((closedResponse.data.content || []).filter((listing) => isOwnPost(listing, currentUserId)));
      } else {
        setClosedListings([]);
      }
    } catch (error) {
      console.error("Failed to fetch flatmate listings", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, isAuthenticated]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handlePostClick = () => {
    if (!isAuthenticated) {
        navigate("/login", { state: { from: { pathname: "/flatmates" } } });
        return;
    }
    setIsModalOpen(true);
  };

  const addListing = async (data) => {
    try {
      const response = await flatmateService.createListing(data);
      if (response.success) {
        await fetchListings();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to post listing" };
    }
  };

  return (
    <main className="min-h-screen bg-ruin-background px-4 py-8 font-body text-ruin-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-5xl font-bold leading-none text-ruin-text sm:text-6xl lg:text-7xl">
              Flatmates
            </h1>
            <p className="mt-4 text-base text-gray-300 sm:text-lg">Find your next roommate or room.</p>
          </div>

          <Button className="sm:mt-2" variant="orange" onClick={handlePostClick}>
            + Post Listing
          </Button>
        </header>

        {isLoading ? (
            <SkeletonCard count={6} />
        ) : listings.length === 0 && closedListings.length === 0 ? (
            <EmptyState 
              icon={Home}
              title="No listings found"
              description="There are currently no flatmate listings. Be the first to post one!"
              actionLabel="+ Post Listing"
              onAction={handlePostClick}
            />
        ) : (
            <ListingSections
              items={listings}
              currentUserId={currentUserId}
              renderCard={(listing, i, isOwnPost) => (
                <FlatmateCard key={listing.id} listing={listing} index={i} isOwnPost={isOwnPost} />
              )}
              extraSections={[
                { title: "Closed By You", items: closedListings },
              ]}
            />
        )}
      </div>

      <PostFlatmateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addListing}
      />
    </main>
  );
}
