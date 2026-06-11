import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { flatmateService } from "../api/flatmateService";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import ChatButton from "../components/chat/ChatButton";
import PostFlatmateModal from "../components/flatmates/PostFlatmateModal";

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

export default function FlatmateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  const fetchListing = async () => {
    setIsLoading(true);
    try {
      const response = await flatmateService.getListingDetails(id);
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
      const response = await flatmateService.updateStatus(id, newStatus);
      if (response.success) {
        await fetchListing();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleEditListing = async (data) => {
    try {
      const response = await flatmateService.updateListing(id, data);
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
            const response = await flatmateService.deleteListing(id);
            if (response.success) {
                navigate("/flatmates");
            }
        } catch (err) {
            console.error("Failed to delete", err);
        }
    }
  };

  const handleInquire = async () => {
    if (!inquiryMessage.trim()) return;
    setIsSubmittingInquiry(true);
    try {
      const response = await flatmateService.sendInquiry(id, inquiryMessage);
      if (response.success) {
        setInquiryMessage("");
        await fetchListing();
      }
    } catch (err) {
      console.error("Failed to send inquiry", err);
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-ruin-muted">Loading listing...</div>;
  if (error || !listing) return <div className="p-8 text-center text-ruin-magenta">{error || "Listing not found"}</div>;

  const currentUserId = getCurrentUserId(user);
  const isOwner = Boolean(currentUserId && listing.poster?.id && currentUserId === String(listing.poster.id));
  const accent = listing.status === "open" ? "#00C9A7" : "#FF2D6F";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 font-body">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-ruin-muted hover:text-ruin-text transition-colors">
          &larr; Back
        </button>
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={() => setIsEditModalOpen(true)} className="text-sm font-medium text-ruin-text px-3 py-1 border border-ruin-border rounded-md hover:border-ruin-orange hover:text-ruin-orange transition-colors">Edit</button>
            {listing.status === "open" && (
                <button onClick={() => handleStatusUpdate("closed")} className="text-sm font-medium text-ruin-background bg-ruin-orange px-3 py-1 rounded-md">Mark as Closed</button>
            )}
            <button onClick={handleDelete} className="text-sm font-medium text-ruin-magenta px-3 py-1 border border-ruin-magenta rounded-md hover:bg-ruin-magenta/10">Delete</button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-ruin-border bg-ruin-card overflow-hidden">
        {listing.imageUrls && listing.imageUrls.length > 0 && (
            <div className="flex w-full overflow-x-auto snap-x snap-mandatory bg-black p-4 gap-4 border-b border-ruin-border">
                {listing.imageUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="shrink-0 w-[85%] md:w-[60%] h-[300px] snap-center block rounded-xl overflow-hidden shadow-lg border border-ruin-border/50 hover:border-ruin-orange/50 transition-colors">
                        <img src={url} alt={`${listing.title} - ${i + 1}`} className="w-full h-full object-cover" />
                    </a>
                ))}
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
        <p className="mt-2 text-lg text-ruin-muted flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {listing.location}
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Description</h3>
              <p className="mt-2 text-ruin-text whitespace-pre-wrap">{listing.description}</p>
            </div>
            
            {listing.amenities && (
                <div>
                  <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                      {listing.amenities.split(',').map(a => a.trim()).filter(a => a).map(a => (
                          <span key={a} className="bg-ruin-background border border-ruin-border px-3 py-1 rounded-full text-sm text-ruin-text">{a}</span>
                      ))}
                  </div>
                </div>
            )}

            <div className="pt-4 border-t border-ruin-border">
              <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Posted By</h3>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={listing.poster?.fullName || "User"} />
                <span className="text-ruin-text font-medium">{listing.poster?.fullName || "User"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-xl border border-ruin-border bg-ruin-background p-5 h-fit">
            <div>
              <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Rent</h3>
              <p className="mt-1 font-heading text-3xl font-bold text-ruin-text">
                ₹{listing.rentPerMonth}<span className="text-base font-normal text-ruin-muted">/mo</span>
              </p>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-ruin-border">
                <div>
                  <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Available</h3>
                  <p className="mt-1 text-ruin-text">{new Date(listing.availableFrom).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider text-right">Pref</h3>
                  <p className="mt-1 text-ruin-text text-right capitalize">{listing.genderPreference}</p>
                </div>
            </div>

            {!isOwner && listing.status !== "open" && (
                <div className="text-center text-ruin-muted">This listing is closed.</div>
            )}

            {!isOwner && listing.status === "open" && (
              <div className="pt-4 border-t border-ruin-border">
                <h3 className="text-sm font-medium text-ruin-text mb-3">Interested?</h3>
                {listing.hasInquired ? (
                  <p className="text-sm text-ruin-muted p-3 bg-ruin-background rounded-lg border border-ruin-border text-center">
                    You have already inquired about this listing.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Hi, I'm interested..."
                      className="w-full resize-none rounded-lg border border-ruin-border bg-ruin-background p-3 text-sm text-ruin-text focus:border-ruin-orange focus:outline-none focus:ring-1 focus:ring-ruin-orange"
                      rows="3"
                    ></textarea>
                    <button
                      onClick={handleInquire}
                      disabled={isSubmittingInquiry || !inquiryMessage.trim()}
                      className="w-full rounded-lg bg-ruin-orange px-4 py-2 font-medium text-ruin-background transition-colors hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isSubmittingInquiry ? "Sending..." : "Send Inquiry"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {isOwner && listing.inquiries && (
        <div className="mt-8">
          <h2 className="font-heading text-2xl font-bold text-ruin-text mb-4">Inquiries ({listing.inquiries.length})</h2>
          {listing.inquiries.length === 0 ? (
            <p className="text-ruin-muted">No one has inquired about this listing yet.</p>
          ) : (
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
                              referenceType="flatmate"
                              referenceId={listing.id}
                              buttonText="Chat"
                          />
                      </div>
                  </div>
                  <p className="text-sm text-ruin-text whitespace-pre-wrap">{inq.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <PostFlatmateModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditListing}
        initialData={listing}
        mode="edit"
      />
    </div>
  );
}
