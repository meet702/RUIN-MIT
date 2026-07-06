import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lostFoundService } from "../api/lostFoundService";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import ChatButton from "../components/chat/ChatButton";
import PostLostFoundModal from "../components/lostfound/PostLostFoundModal";
import { Search, Info, ChevronLeft, ChevronRight } from "lucide-react";
import SkeletonDetail from "../components/ui/SkeletonDetail";
import DetailPageLayout from "../components/layout/DetailPageLayout";
import ActionLoader from "../components/ui/ActionLoader";

export default function LostFoundDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEditPost = async (data) => {
    try {
      const response = await lostFoundService.updatePost(id, data);
      if (response.success) {
        await fetchPost();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update post" };
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
        setIsDeleting(true);
        try {
            const response = await lostFoundService.deletePost(id);
            if (response.success) {
                navigate("/lost-found");
            } else {
                alert(response.message || "Failed to delete post.");
                setIsDeleting(false);
            }
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Failed to delete post.");
            setIsDeleting(false);
        }
    }
  };

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (isLoading) return <SkeletonDetail />;
  if (error || !post) return <div className="p-8 text-center text-ruin-magenta">{error || "Post not found"}</div>;

  const posterId = post.posterId || post.poster?.id;
  const posterName = post.posterFullName || post.poster?.fullName;
  const isOwner = user?.id && posterId && String(user.id) === String(posterId);
  const isLost = post.type === "lost";
  const accent = isLost ? "#F26522" : "#00C9A7";
  const rawImageUrls = post.imageUrls || post.images?.map((image) => image.imageUrl) || [];
  
  // Filter out any raw path strings that might have leaked from the backend
  const validImageUrls = rawImageUrls.filter(url => url && (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')));

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === validImageUrls.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? validImageUrls.length - 1 : prev - 1));
  };

  const headerActions = isOwner ? (
    <>
      <button onClick={() => setIsEditModalOpen(true)} className="text-sm font-medium text-ruin-text px-3 py-1 border border-ruin-border rounded-md hover:border-ruin-orange hover:text-ruin-orange transition-colors">Edit</button>
      {post.status === "open" && (
          <button onClick={() => handleStatusUpdate("resolved")} className="text-sm font-medium text-ruin-background bg-[#00C9A7] px-3 py-1 rounded-md hover:bg-teal-500 transition-colors">Mark as Resolved</button>
      )}
      <button onClick={handleDelete} className="text-sm font-medium text-ruin-magenta px-3 py-1 border border-ruin-magenta rounded-md hover:bg-ruin-magenta/10 transition-colors">Delete</button>
    </>
  ) : null;

  const heroImage = validImageUrls.length > 0 ? (
    <div className="relative w-full bg-black border-b border-ruin-border group">
        <div className="flex w-full overflow-hidden h-[300px] relative items-center justify-center">
            {validImageUrls.map((url, i) => (
                <div 
                    key={i} 
                    className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center p-4 ${i === activeImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <a href={url} target="_blank" rel="noreferrer" className="w-[85%] md:w-[60%] h-full flex items-center justify-center rounded-xl overflow-hidden bg-ruin-background shadow-lg border border-ruin-border/50 hover:border-ruin-orange/50 transition-colors">
                        <img src={url} alt={`${post.title} - ${i + 1}`} className="h-full w-full object-contain" />
                    </a>
                </div>
            ))}
        </div>
        {validImageUrls.length > 1 && (
            <>
                <button 
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ruin-orange"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ruin-orange"
                >
                    <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                    {validImageUrls.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setActiveImageIndex(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === activeImageIndex ? 'bg-ruin-orange' : 'bg-white/30 hover:bg-white/70'}`}
                        />
                    ))}
                </div>
            </>
        )}
    </div>
  ) : (
      <div className="w-full h-48 bg-ruin-background flex items-center justify-center border-b border-ruin-border">
          {isLost ? <Search size={64} className="text-ruin-muted/50" /> : <Info size={64} className="text-ruin-muted/50" />}
      </div>
  );

  const badges = (
    <>
        <span className="inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.04em] uppercase" style={{ backgroundColor: `${accent}1A`, color: accent }}>
            {post.type}
        </span>
        {post.status !== "open" && (
            <span className="inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold uppercase bg-ruin-background border border-ruin-border text-ruin-muted">
                Resolved
            </span>
        )}
    </>
  );

  const mainContent = (
    <>
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
    </>
  );

  const sidebarContent = (
    <div className="space-y-6 rounded-xl border border-ruin-border bg-ruin-background p-5 h-fit text-center">
        <h3 className="text-sm font-medium text-ruin-muted uppercase tracking-wider">Status</h3>
        {post.status === "open" ? (
            <div className="mt-2 py-2 px-4 rounded-full border border-ruin-orange/30 bg-ruin-orange/10 text-ruin-orange font-semibold text-sm inline-block">
                Still searching...
            </div>
        ) : (
            <div className="mt-2 py-2 px-4 rounded-full border border-[#00C9A7]/30 bg-[#00C9A7]/10 text-[#00C9A7] font-semibold text-sm inline-block">
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
  );

  return (
    <>
      {isDeleting && <ActionLoader message="Deleting post..." />}
      <DetailPageLayout
        title={post.title}
        postedAt={new Date(post.createdAt).toLocaleDateString()}
        badges={badges}
        headerActions={headerActions}
        heroImage={heroImage}
        mainContent={mainContent}
        sidebarContent={sidebarContent}
      />
      <PostLostFoundModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditPost}
        initialData={post}
        mode="edit"
      />
    </>
  );
}
