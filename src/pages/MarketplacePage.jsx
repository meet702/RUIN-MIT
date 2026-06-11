import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceService } from "../api/marketplaceService";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import MarketplaceCard from "../components/marketplace/MarketplaceCard";
import PostMarketplaceModal from "../components/marketplace/PostMarketplaceModal";
import ListingSections from "../components/listings/ListingSections";
import Tag from "../components/ui/Tag";
import { getCurrentUserId } from "../utils/ownership";

const CATEGORIES = ["All", "books", "electronics", "cycles", "stationery", "clothing", "furniture", "other"];

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId(user);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const cat = selectedCategory === "All" ? null : selectedCategory;
      const response = await marketplaceService.getListings(cat, null, "available", 0, 50);
      if (response.success) {
        setListings(response.data.content || []);
      }
    } catch (error) {
      console.error("Failed to fetch marketplace listings", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handlePostClick = () => {
    if (!isAuthenticated) {
        navigate("/login", { state: { from: { pathname: "/marketplace" } } });
        return;
    }
    setIsModalOpen(true);
  };

  const addListing = async (data) => {
    try {
      const response = await marketplaceService.createListing(data);
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
              Marketplace
            </h1>
            <p className="mt-4 text-base text-ruin-muted sm:text-lg">Buy and sell items within the campus.</p>
          </div>

          <Button className="sm:mt-2" variant="orange" onClick={handlePostClick}>
            + Sell an Item
          </Button>
        </header>

        <div className="-mx-4 mt-10 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex snap-x snap-mandatory gap-3 pb-2">
            {CATEGORIES.map((category) => (
              <Tag
                key={category}
                active={selectedCategory === category}
                className="capitalize"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Tag>
            ))}
          </div>
        </div>
        
        {isLoading ? (
            <div className="mt-12 text-center text-ruin-muted">Loading listings...</div>
        ) : listings.length === 0 ? (
            <div className="mt-12 text-center p-12 border border-ruin-border rounded-xl bg-ruin-card/50 text-ruin-muted">
                No items found in this category.
            </div>
        ) : (
            <ListingSections
              items={listings}
              currentUserId={currentUserId}
              renderCard={(listing, i, isOwnPost) => (
                <MarketplaceCard key={listing.id} listing={listing} index={i} isOwnPost={isOwnPost} />
              )}
            />
        )}
      </div>

      <PostMarketplaceModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addListing}
      />
    </main>
  );
}
