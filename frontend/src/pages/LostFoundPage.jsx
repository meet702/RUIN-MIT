import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { lostFoundService } from "../api/lostFoundService";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import LostFoundCard from "../components/lostfound/LostFoundCard";
import PostLostFoundModal from "../components/lostfound/PostLostFoundModal";
import ListingSections from "../components/listings/ListingSections";
import Tag from "../components/ui/Tag";
import FilterPillGroup from "../components/ui/FilterPillGroup";
import { getCurrentUserId, isOwnPost } from "../utils/ownership";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";
import { Search } from "lucide-react";

export default function LostFoundPage() {
  const [posts, setPosts] = useState([]);
  const [resolvedPosts, setResolvedPosts] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId(user);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const type = selectedType === "All" ? null : selectedType;
      const [openResponse, resolvedResponse] = await Promise.all([
        lostFoundService.getPosts(type, "open", 0, 50),
        isAuthenticated ? lostFoundService.getPosts(type, "resolved", 0, 50) : Promise.resolve(null),
      ]);
      if (openResponse.success) {
        setPosts(openResponse.data.content || []);
      }
      if (resolvedResponse?.success) {
        setResolvedPosts((resolvedResponse.data.content || []).filter((post) => isOwnPost(post, currentUserId)));
      } else {
        setResolvedPosts([]);
      }
    } catch (error) {
      console.error("Failed to fetch lost & found posts", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, isAuthenticated, selectedType]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostClick = () => {
    if (!isAuthenticated) {
        navigate("/login", { state: { from: { pathname: "/lost-found" } } });
        return;
    }
    setIsModalOpen(true);
  };

  const addPost = async (data) => {
    try {
      const response = await lostFoundService.createPost(data);
      if (response.success) {
        await fetchPosts();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to post" };
    }
  };

  return (
    <main className="min-h-screen bg-ruin-background px-4 py-8 font-body text-ruin-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-5xl font-bold leading-none text-ruin-text sm:text-6xl lg:text-7xl">
              Lost & Found
            </h1>
            <p className="mt-4 text-base text-gray-300 sm:text-lg">Reunite items with their owners.</p>
          </div>

          <Button className="sm:mt-2" variant="orange" onClick={handlePostClick}>
            + Report Item
          </Button>
        </header>

        <FilterPillGroup>
          {["All", "lost", "found"].map((type) => (
            <Tag
              key={type}
              active={selectedType === type}
              className="capitalize"
              onClick={() => setSelectedType(type)}
            >
              {type}
            </Tag>
          ))}
        </FilterPillGroup>
        
        {isLoading ? (
            <SkeletonCard count={6} />
        ) : posts.length === 0 && resolvedPosts.length === 0 ? (
            <EmptyState 
              icon={Search}
              title="No items found"
              description="There are currently no lost & found items. Report a new item if needed."
              actionLabel="+ Report Item"
              onAction={handlePostClick}
            />
        ) : (
            <ListingSections
              items={posts}
              currentUserId={currentUserId}
              renderCard={(post, i, isOwnPost) => (
                <LostFoundCard key={post.id} post={post} index={i} isOwnPost={isOwnPost} />
              )}
              extraSections={[
                { title: "Resolved By You", items: resolvedPosts },
              ]}
            />
        )}
      </div>

      <PostLostFoundModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addPost}
      />
    </main>
  );
}
