import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { marketplaceService } from "../api/marketplaceService";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import ChatButton from "../components/chat/ChatButton";
import PostMarketplaceModal from "../components/marketplace/PostMarketplaceModal";
import { Package } from "lucide-react";

function getCurrentUserId(user) {
  if (user?.id) {
    return String(user.id);
  }

  const storedUserId = localStorage.getItem("userId");
  if (storedUserId) {
    return String(storedUserId);
  }

  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser)?.id ? String(JSON.parse(storedUser).id) : null;
  } catch {
    return null;
  }
}

export default function MarketplaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchListing = async () => {
    setIsLoading(true);
    try {
      const response = await marketplaceService.getListingDetails(id);
      if (response.success) {
        setListing(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load listing details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await marketplaceService.updateStatus(id, newStatus);
      if (response.success) {
        await fetchListing();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleEditListing = async (data) => {
    try {
      const response = await marketplaceService.updateListing(id, data);
      if (response.success) {
        await fetchListing();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update listing" };
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
        try {
            const response = await marketplaceService.deleteListing(id);
            if (response.success) {
                navigate("/marketplace");
            }
        } catch (err) {
            console.error("Failed to delete", err);
        }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-ruin-muted">Loading listing...</div>;
  if (error || !listing) return <div className="p-8 text-center text-ruin-magenta">{error || "Listing not found"}</div>;

  const sellerId = listing.sellerId || listing.poster?.id;
  const sellerName = listing.sellerFullName || listing.poster?.fullName;
  const currentUserId = getCurrentUserId(user);
  const isOwner = Boolean(currentUserId && sellerId && currentUserId === String(sellerId));
  const accent = listing.status === "available" ? "#00C9A7" : "#FF2D6F";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 font-body">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-ruin-muted hover:text-ruin-text transition-colors">
          &larr; Back
        </button>
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={() => setIsEditModalOpen(true)} className="text-sm font-medium text-ruin-text px-3 py-1 border border-ruin-border rounded-md hover:border-ruin-orange hover:text-ruin-orange transition-colors">Edit</button>
            {listing.status === "available" && (
                <button onClick={() => handleStatusUpdate("sold")} className="text-sm font-medium text-ruin-background bg-ruin-orange px-3 py-1 rounded-md">Mark as Sold</button>
            )}
            <button onClick={handleDelete} className="text-sm font-medium text-ruin-magenta px-3 py-1 border border-ruin-magenta rounded-md hover:bg-ruin-magenta/10">Delete</button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-ruin-border bg-ruin-card overflow-hidden">
        {listing.imageUrls && listing.imageUrls.length > 0 ? (
            <div className="flex w-full overflow-x-auto snap-x snap-mandatory bg-black p-4 gap-4">
                {listing.imageUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="shrink-0 w-[85%] md:w-[60%] h-[300px] snap-center block rounded-xl overflow-hidden shadow-lg border border-ruin-border/50 hover:border-ruin-orange/50 transition-colors">
                        <img src={url} alt={`${listing.title} - ${i + 1}`} className="w-full h-full object-cover" />
                    </a>
                ))}
            </div>
        ) : (
            <div className="w-full h-48 bg-ruin-background flex items-center justify-center border-b border-ruin-border">
                <Package size={64} className="text-ruin-muted/50" />
            </div>
        )}
      
        <div className="p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.04em] capitalize" style={{ backgroundColor: `${accent}1A`, color: accent }}>
                {listing.status}
            </span>
            <span className="text-sm text-ruin-muted">Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>

            <h1 className="font-heading text-3xl font-bold text-ruin-text md:text-4xl">{listing.title}</h1>

            <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                <div>
                <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Description</h3>
                <p className="mt-2 text-ruin-text whitespace-pre-wrap">{listing.description || "No description provided."}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ruin-border">
                    <div>
                        <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Category</h3>
                        <p className="mt-1 text-ruin-text capitalize">{listing.category}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Condition</h3>
                        <p className="mt-1 text-ruin-text capitalize">{listing.condition?.replace("_", " ")}</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-ruin-border">
                <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Seller</h3>
                <div className="mt-3 flex items-center gap-3">
                    <Avatar name={sellerName} />
                    <span className="text-ruin-text font-medium">{sellerName}</span>
                </div>
                </div>
            </div>

            <div className="space-y-6 rounded-xl border border-ruin-border bg-ruin-background p-5 h-fit">
                <div>
                <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Price</h3>
                <p className="mt-1 font-heading text-4xl font-bold text-ruin-text">
                    ₹{listing.price}
                </p>
                </div>

                {!isOwner && listing.status !== "available" && (
                    <div className="pt-4 border-t border-ruin-border text-center text-ruin-muted">This item is sold.</div>
                )}

                {!isOwner && listing.status === "available" && (
                    <div className="pt-4 border-t border-ruin-border">
                        <h3 className="text-sm font-medium text-ruin-text mb-3">Interested?</h3>
                        <ChatButton
                            otherUserId={sellerId}
                            otherUserName={sellerName}
                            referenceType="marketplace"
                            referenceId={listing.id}
                            buttonText="Chat with seller"
                        />
                    </div>
                )}
            </div>
            </div>
        </div>
      </div>

      {isOwner && listing.inquiries && listing.inquiries.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-2xl font-bold text-ruin-text mb-4">Inquiries ({listing.inquiries.length})</h2>
          <div className="space-y-4">
            {listing.inquiries.map((inq) => (
              <div key={inq.id} className="rounded-xl border border-ruin-border bg-ruin-card p-5">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar name={inq.sender?.fullName || inq.inquirerFullName || "User"} />
                    <div>
                        <span className="text-ruin-text font-medium block">{inq.sender?.fullName || inq.inquirerFullName || "User"}</span>
                        <span className="text-xs text-ruin-muted">{new Date(inq.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="ml-auto">
                        <ChatButton
                            otherUserId={inq.sender?.id || inq.senderId}
                            otherUserName={inq.sender?.fullName || inq.inquirerFullName}
                            referenceType="marketplace"
                            referenceId={listing.id}
                            buttonText="Chat"
                        />
                    </div>
                </div>
                <p className="text-sm text-ruin-text whitespace-pre-wrap">{inq.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <PostMarketplaceModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditListing}
        initialData={listing}
        mode="edit"
      />
    </div>
  );
}
