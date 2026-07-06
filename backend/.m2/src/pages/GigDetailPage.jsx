import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gigService } from "../api/gigService";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import GigBadge from "../components/gigs/GigBadge";
import Button from "../components/ui/Button";
import ChatButton from "../components/chat/ChatButton";

export default function GigDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [gig, setGig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [applicationMessage, setApplicationMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  const fetchGig = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGig();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/gigs/${id}` } } });
      return;
    }

    setIsApplying(true);
    setApplyError("");

    try {
      const response = await gigService.applyToGig(id, applicationMessage);
      if (response.success) {
        setApplicationMessage("");
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

  const handleAcceptApplicant = async (appId) => {
    try {
      const response = await gigService.acceptApplicant(id, appId);
      if (response.success) {
        await fetchGig();
      }
    } catch (err) {
      console.error("Failed to accept applicant", err);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-ruin-muted">Loading gig...</div>;
  }

  if (error || !gig) {
    return <div className="p-8 text-center text-ruin-magenta">{error || "Gig not found"}</div>;
  }

  const isPoster = user?.id === gig.posterId;
  const formattedDeadline = gig.deadline ? new Date(gig.deadline).toLocaleDateString() : "Flexible";
  const postedAt = gig.createdAt ? new Date(gig.createdAt).toLocaleDateString() : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 font-body">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-ruin-muted hover:text-ruin-text transition-colors">
          &larr; Back
        </button>
        {isPoster && (
          <div className="flex gap-2">
            {gig.status === "open" && (
                <button onClick={() => handleStatusUpdate("cancelled")} className="text-sm font-medium text-ruin-magenta px-3 py-1 border border-ruin-magenta rounded-md">Cancel Gig</button>
            )}
            {gig.status === "in_progress" && (
                <button onClick={() => handleStatusUpdate("completed")} className="text-sm font-medium text-ruin-background bg-ruin-orange px-3 py-1 rounded-md">Mark Completed</button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <GigBadge status={gig.status} />
          <span className="text-sm text-ruin-muted">Posted {postedAt}</span>
        </div>

        <h1 className="font-heading text-3xl font-bold text-ruin-text md:text-4xl">{gig.title}</h1>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
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
          </div>

          <div className="space-y-6 rounded-xl border border-ruin-border bg-ruin-background p-5 h-fit">
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

            {!isPoster && gig.status === "open" && (
              <div className="pt-4 border-t border-ruin-border">
                {applyError && <p className="mb-2 text-sm text-ruin-magenta">{applyError}</p>}
                <form onSubmit={handleApply} className="space-y-3">
                  <textarea
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    placeholder="Why are you a good fit?"
                    className="w-full rounded-lg border border-ruin-border bg-ruin-card p-3 text-sm text-ruin-text outline-none focus:border-ruin-orange min-h-[80px]"
                    required
                  />
                  <Button type="submit" className="w-full" disabled={isApplying}>
                    {isApplying ? "Applying..." : "Apply Now"}
                  </Button>
                </form>
              </div>
            )}
            
            {!isPoster && gig.status !== "open" && (
                <div className="pt-4 border-t border-ruin-border text-center text-ruin-muted">
                    This gig is no longer accepting applications.
                </div>
            )}

            {!isPoster && gig.hasApplied && (
              <div className="pt-4 border-t border-ruin-border">
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
        </div>
      </div>

      {isPoster && gig.applications && gig.applications.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-2xl font-bold text-ruin-text mb-4">Applications ({gig.applications.length})</h2>
          <div className="space-y-4">
            {gig.applications.map((app) => (
              <div key={app.id} className="rounded-xl border border-ruin-border bg-ruin-card p-5">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar name={app.applicantFullName} />
                        <div>
                            <span className="text-ruin-text font-medium block">{app.applicantFullName}</span>
                            <span className="text-xs text-ruin-muted">{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.isAccepted && (
                          <span className="text-xs font-semibold text-ruin-background bg-[#00C9A7] px-2 py-1 rounded">ACCEPTED</span>
                      )}
                      {!app.isAccepted && gig.status === "open" && (
                        <button 
                            onClick={() => handleAcceptApplicant(app.id)}
                            className="text-xs font-semibold text-[#00C9A7] border border-[#00C9A7] hover:bg-[#00C9A7]/10 px-3 py-1 rounded transition-colors"
                        >
                            Accept Applicant
                        </button>
                      )}
                        <ChatButton
                            otherUserId={app.applicantId}
                            otherUserName={app.applicantFullName}
                            referenceType="gig"
                            referenceId={gig.id}
                            buttonText="Chat"
                        />
                    </div>
                </div>
                <p className="mt-4 text-sm text-ruin-text whitespace-pre-wrap">{app.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
