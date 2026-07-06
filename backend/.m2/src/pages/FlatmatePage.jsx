import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { flatmateService } from "../api/flatmateService";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import FlatmateCard from "../components/flatmates/FlatmateCard";
import PostFlatmateModal from "../components/flatmates/PostFlatmateModal";
import Tag from "../components/ui/Tag";

export default function FlatmatePage() {
  const [listings, setListings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("open");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await flatmateService.getListings(selectedStatus === "All" ? null : selectedStatus, null, 0, 50);
      if (response.success) {
        setListings(response.data.content || []);
      }
    } catch (error) {
      console.error("Failed to fetch flatmate listings", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus]);

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
            <p className="mt-4 text-base text-ruin-muted sm:text-lg">Find your next roommate or room.</p>
          </div>

          <Button className="sm:mt-2" variant="orange" onClick={handlePostClick}>
            + Post Listing
          </Button>
        </header>

        <div className="-mx-4 mt-10 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex snap-x snap-mandatory gap-3 pb-2">
            {["All", "open", "closed"].map((status) => (
              <Tag
                key={status}
                active={selectedStatus === status}
                className="capitalize"
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Tag>
            ))}
          </div>
        </div>
        
        {isLoading ? (
            <div className="mt-12 text-center text-ruin-muted">Loading listings...</div>
        ) : listings.length === 0 ? (
            <div className="mt-12 text-center p-12 border border-ruin-border rounded-xl bg-ruin-card/50 text-ruin-muted">
                No listings found.
            </div>
        ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing, i) => (
                <FlatmateCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
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
