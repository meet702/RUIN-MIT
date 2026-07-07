import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { gigService } from "../api/gigService";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import GigBadge from "../components/gigs/GigBadge";
import Button from "../components/ui/Button";
import ChatButton from "../components/chat/ChatButton";
import PostGigModal from "../components/gigs/PostGigModal";
import { getCurrentUserId, isOwnPost } from "../utils/ownership";
import SkeletonDetail from "../components/ui/SkeletonDetail";
import DetailPageLayout from "../components/layout/DetailPageLayout";
import InquiriesList from "../components/chat/InquiriesList";
import ActionLoader from "../components/ui/ActionLoader";

export default function GigDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [gig, setGig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  

  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [applicantAction, setApplicantAction] = useState(null);

  const fetchGig = async ({ showPageLoading = true } = {}) => {
    if (showPageLoading) {
      setIsLoading(true);
    }
    try {
      const response = await gigService.getGigDetails(id);
      if (response.success) {
        setGig(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load gig details");
    } finally {
      if (showPageLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchGig();
  }, [id]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/gigs/${id}` } } });
      return;
    }

    setIsApplying(true);
    setApplyError("");

    try {
      const response = await gigService.applyToGig(id, "I am interested in this gig.");
      if (response.success) {
        await fetchGig(); // Refresh to potentially show application
      } else {
        setApplyError(response.message || "Failed to apply");
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await gigService.updateGigStatus(id, newStatus);
      if (response.success) {
        await fetchGig();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleEditGig = async (data) => {
    try {
      const response = await gigService.updateGig(id, data);
      if (response.success) {
        await fetchGig();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update gig" };
    }
  };

  const handleAcceptApplicant = async (appId) => {
    if (applicantAction) return;

    setApplicantAction({ appId, type: "accept" });
    try {
      const response = await gigService.acceptApplicant(id, appId);
      if (response.success) {
        await fetchGig({ showPageLoading: false });
      }
    } catch (err) {
      console.error("Failed to accept applicant", err);
    } finally {
      setApplicantAction(null);
    }
  };

  const handleUnacceptApplicant = async (appId) => {
    if (applicantAction) return;

    setApplicantAction({ appId, type: "unaccept" });
    try {
      const response = await gigService.unacceptApplicant(id, appId);
      if (response.success) {
        await fetchGig({ showPageLoading: false });
      }
    } catch (err) {
      console.error("Failed to unaccept applicant", err);
    } finally {
      setApplicantAction(null);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this gig?")) {
        setIsDeleting(true);
        try {
            const response = await gigService.deleteGig(id);
            if (response.success) {
                navigate("/gigs");
            } else {
                alert(response.message || "Failed to delete gig.");
                setIsDeleting(false);
            }
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Failed to delete gig.");
            setIsDeleting(false);
        }
    }
  };

  if (isLoading) {
    return <SkeletonDetail />;
  }

  if (error || !gig) {
    return <div className="p-8 text-center text-ruin-magenta">{error || "Gig not found"}</div>;
  }

  const currentUserId = getCurrentUserId(user);
  const isPoster = isOwnPost(gig, currentUserId);
  const formattedDeadline = gig.deadline ? new Date(gig.deadline).toLocaleDateString() : "Flexible";
  const postedAt = gig.createdAt ? new Date(gig.createdAt).toLocaleDateString() : "";

  const headerActions = isPoster ? (
    <>
      <button onClick={() => setIsEditModalOpen(true)} className="text-sm font-medium text-ruin-text px-3 py-1 border border-ruin-border rounded-md hover:border-ruin-orange hover:text-ruin-orange transition-colors">Edit</button>
      {gig.status === "in_progress" && (
          <button onClick={() => handleStatusUpdate("completed")} className="text-sm font-medium text-ruin-background bg-[#00C9A7] px-3 py-1 rounded-md hover:bg-teal-500 transition-colors">Mark Completed</button>
      )}
      <button onClick={handleDelete} className="text-sm font-medium text-ruin-magenta px-3 py-1 border border-ruin-magenta rounded-md hover:bg-ruin-magenta/10 transition-colors">Delete</button>
    </>
  ) : null;

  const mainContent = (
    <>
      <div>
        <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Description</h3>
        <p className="mt-2 text-ruin-text whitespace-pre-wrap">{gig.description}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Posted By</h3>
        <div className="mt-3 flex items-center gap-3">
          <Avatar name={gig.posterFullName} />
          <span className="text-ruin-text font-medium">{gig.posterFullName}</span>
        </div>
      </div>
    </>
  );

  const sidebarContent = (
    <div className="space-y-6 rounded-xl border border-ruin-border bg-ruin-background p-5">
      <div>
        <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Budget</h3>
        <p className="mt-1 font-heading text-3xl font-bold text-[#00C9A7]">
          ₹{gig.budget || 0}
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Deadline</h3>
        <p className="mt-1 text-ruin-text">{formattedDeadline}</p>
      </div>

      {!isPoster && gig.status === "open" && !gig.hasApplied && (
        <div className="pt-4 border-t border-ruin-border">
          {applyError && <p className="mb-2 text-sm text-ruin-magenta">{applyError}</p>}
          <Button className="w-full" variant="orange" disabled={isApplying} onClick={handleApply}>
            {isApplying ? "Sending..." : "I am Interested"}
          </Button>
        </div>
      )}

      {!isPoster && gig.hasApplied && (
        <div className="pt-4 border-t border-ruin-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ruin-muted">Your Application</span>
            {gig.applicationAccepted ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#00C9A7]/15 text-[#00C9A7] px-3 py-1 rounded-full border border-[#00C9A7]/30">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Accepted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-ruin-orange/15 text-ruin-orange px-3 py-1 rounded-full border border-ruin-orange/30">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
                Pending
              </span>
            )}
          </div>
          <ChatButton
            otherUserId={gig.posterId}
            otherUserName={gig.posterFullName}
            referenceType="gig"
            referenceId={gig.id}
            buttonText="Chat with Poster"
          />
        </div>
      )}
    </div>
  );

  const bottomContent = isPoster && gig.applications && gig.applications.length > 0 ? (
    <InquiriesList 
        inquiries={gig.applications.map(app => ({
            ...app,
            customActions: (
                <>
                    {app.isAccepted && (
                        <>
                        <span className="text-xs font-semibold text-ruin-background bg-[#00C9A7] px-2 py-1 rounded">ACCEPTED</span>
                        {applicantAction?.appId === app.id && applicantAction.type === "unaccept" ? (
                          <button 
                              disabled
                              className="inline-flex min-w-[84px] items-center justify-center gap-1.5 rounded border border-ruin-magenta px-3 py-1 text-xs font-semibold text-ruin-magenta opacity-70"
                          >
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Unaccepting
                          </button>
                        ) : (
                        <button 
                            onClick={() => handleUnacceptApplicant(app.id)}
                            disabled={Boolean(applicantAction)}
                            className="text-xs font-semibold text-ruin-magenta border border-ruin-magenta hover:bg-ruin-magenta/10 px-3 py-1 rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Unaccept
                        </button>
                        )}
                        </>
                    )}
                    {!app.isAccepted && gig.status === "open" && (
                      applicantAction?.appId === app.id && applicantAction.type === "accept" ? (
                        <button 
                            disabled
                            className="inline-flex min-w-[124px] items-center justify-center gap-1.5 rounded border border-[#00C9A7] px-3 py-1 text-xs font-semibold text-[#00C9A7] opacity-70"
                        >
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Accepting
                        </button>
                      ) : (
                        <button 
                            onClick={() => handleAcceptApplicant(app.id)}
                            disabled={Boolean(applicantAction)}
                            className="text-xs font-semibold text-[#00C9A7] border border-[#00C9A7] hover:bg-[#00C9A7]/10 px-3 py-1 rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Accept Applicant
                        </button>
                      )
                    )}
                </>
            )
        }))} 
        title="Applications" 
        referenceType="gig" 
        referenceId={gig.id} 
    />
  ) : null;

  return (
    <>
      {isDeleting && <ActionLoader message="Deleting gig..." />}
      {applicantAction && (
        <ActionLoader message={applicantAction.type === "accept" ? "Accepting applicant..." : "Unaccepting applicant..."} />
      )}
      <DetailPageLayout
        title={gig.title}
        postedAt={postedAt}
        badges={<GigBadge status={gig.status} />}
        headerActions={headerActions}
        mainContent={mainContent}
        sidebarContent={sidebarContent}
        bottomContent={bottomContent}
      />
      <PostGigModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditGig}
        initialData={gig}
        mode="edit"
      />
    </>
  );
}
