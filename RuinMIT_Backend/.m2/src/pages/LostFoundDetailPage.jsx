import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lostFoundService } from "../api/lostFoundService";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import ChatButton from "../components/chat/ChatButton";
import { Search, Info } from "lucide-react";

export default function LostFoundDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const response = await lostFoundService.getPostById(id);
      if (response.success) {
        setPost(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load post details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await lostFoundService.updateStatus(id, newStatus);
      if (response.success) {
        await fetchPost();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
        try {
            const response = await lostFoundService.deletePost(id);
            if (response.success) {
                navigate("/lost-found");
            }
        } catch (err) {
            console.error("Failed to delete", err);
        }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-ruin-muted">Loading post...</div>;
  if (error || !post) return <div className="p-8 text-center text-ruin-magenta">{error || "Post not found"}</div>;

  const posterId = post.posterId || post.poster?.id;
  const posterName = post.posterFullName || post.poster?.fullName;
  const isOwner = user?.id && posterId && String(user.id) === String(posterId);
  const isLost = post.type === "lost";
  const accent = isLost ? "#F26522" : "#00C9A7";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 font-body">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-ruin-muted hover:text-ruin-text transition-colors">
          &larr; Back
        </button>
        {isOwner && (
          <div className="flex gap-2">
            {post.status === "open" && (
                <button onClick={() => handleStatusUpdate("resolved")} className="text-sm font-medium text-ruin-background bg-ruin-orange px-3 py-1 rounded-md">Mark as Resolved</button>
            )}
            <button onClick={handleDelete} className="text-sm font-medium text-ruin-magenta px-3 py-1 border border-ruin-magenta rounded-md hover:bg-ruin-magenta/10">Delete</button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-ruin-border bg-ruin-card overflow-hidden">
        {post.images && post.images.length > 0 ? (
            <div className="w-full h-64 md:h-96 bg-black flex items-center justify-center relative overflow-x-auto snap-x">
                {post.images.map(img => (
                    <img key={img.id} src={img.imageUrl} alt="Item" className="max-w-full max-h-full object-contain shrink-0 snap-center mx-4" />
                ))}
            </div>
        ) : (
            <div className="w-full h-48 bg-ruin-background flex items-center justify-center border-b border-ruin-border">
                {isLost ? <Search size={64} className="text-ruin-muted/50" /> : <Info size={64} className="text-ruin-muted/50" />}
            </div>
        )}
      
        <div className="p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
                <span className="inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.04em] uppercase" style={{ backgroundColor: `${accent}1A`, color: accent }}>
                    {post.type}
                </span>
                {post.status !== "open" && (
                    <span className="inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold uppercase bg-ruin-background border border-ruin-border text-ruin-muted">
                        Resolved
                    </span>
                )}
            </div>
            <span className="text-sm text-ruin-muted">Posted {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            <h1 className="font-heading text-3xl font-bold text-ruin-text md:text-4xl">{post.title}</h1>

            <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                <div>
                <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Description</h3>
                <p className="mt-2 text-ruin-text whitespace-pre-wrap">{post.description}</p>
                </div>
                
                <div className="pt-4 border-t border-ruin-border">
                <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Location</h3>
                <p className="mt-2 text-ruin-text font-medium">{post.locationFoundLost}</p>
                </div>

                <div className="pt-4 border-t border-ruin-border">
                <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Contact Poster</h3>
                <div className="mt-3 flex items-center gap-3">
                    <Avatar name={posterName} />
                    <div>
                        <span className="text-ruin-text font-medium block">{posterName}</span>
                        {!isOwner && <span className="text-sm text-ruin-muted">Message or find them on campus</span>}
                    </div>
                </div>
                </div>
            </div>

            <div className="space-y-6 rounded-xl border border-ruin-border bg-ruin-background p-5 h-fit text-center">
                <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Status</h3>
                {post.status === "open" ? (
                    <div className="mt-2 py-3 px-4 rounded-lg border border-ruin-orange/30 bg-ruin-orange/10 text-ruin-orange font-medium">
                        Still searching...
                    </div>
                ) : (
                    <div className="mt-2 py-3 px-4 rounded-lg border border-[#00C9A7]/30 bg-[#00C9A7]/10 text-[#00C9A7] font-medium">
                        Reunited!
                    </div>
                )}
                
                {!isOwner && post.status === "open" && (
                    <div className="mt-4 border-t border-ruin-border pt-4">
                        <ChatButton
                            otherUserId={posterId}
                            otherUserName={posterName}
                            referenceType="lost_found"
                            referenceId={post.id}
                            buttonText="Chat with poster"
                        />
                        {!isAuthenticated && (
                            <p className="mt-3 text-xs text-ruin-muted">
                                Log in to message the poster about this item.
                            </p>
                        )}
                    </div>
                )}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}
