import { useCallback, useState, useEffect } from "react";
import { gigService } from "../api/gigService";
import { isOwnPost } from "../utils/ownership";

function getGigErrorMessage(error) {
  const responseData = error.response?.data;

  if (responseData?.errors && typeof responseData.errors === "object") {
    return Object.values(responseData.errors).filter(Boolean).join(", ");
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (error.response?.status === 401) {
    return "Please log in again to post a gig.";
  }

  if (error.response?.status === 403) {
    return "You are not allowed to post a gig with this session. Please log in again.";
  }

  return "Failed to post gig";
}

export function useGigs({ currentUserId, isAuthenticated } = {}) {
  const [gigs, setGigs] = useState([]);
  const [finishedGigs, setFinishedGigs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("open");
  const [isExiting, setIsExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const [response, completedResponse, cancelledResponse] = await Promise.all([
        gigService.getOpenGigs(0, 50),
        isAuthenticated ? gigService.getGigs("completed", 0, 50) : Promise.resolve(null),
        isAuthenticated ? gigService.getGigs("cancelled", 0, 50) : Promise.resolve(null),
      ]);
      if (response.success) {
        setGigs(response.data.content || []);
      }
      if (completedResponse?.success || cancelledResponse?.success) {
        const inactiveGigs = [
          ...(completedResponse?.success ? completedResponse.data.content || [] : []),
          ...(cancelledResponse?.success ? cancelledResponse.data.content || [] : []),
        ];
        setFinishedGigs(inactiveGigs.filter((gig) => isOwnPost(gig, currentUserId)));
      } else {
        setFinishedGigs([]);
      }
    } catch (error) {
      console.error("Failed to fetch gigs", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, isAuthenticated]);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  const visibleGigs = gigs.filter(gig => selectedStatus === "All" || gig.status === selectedStatus);

  const selectStatus = useCallback(
    (status) => {
      if (status === selectedStatus) return;
      setSelectedStatus(status);
      setIsExiting(true);
      window.setTimeout(() => {
        setIsExiting(false);
      }, 150);
    },
    [selectedStatus]
  );

  const addGig = useCallback(async (gigData) => {
    try {
      const response = await gigService.createGig(gigData);
      if (response.success) {
        setGigs(prev => {
          // Prevent duplicates if fetchGigs already got it
          if (prev.some(g => g.id === response.data.id)) return prev;
          return [response.data, ...prev];
        });
        await fetchGigs();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error("Failed to post gig", error);
      return { success: false, message: getGigErrorMessage(error) };
    }
  }, [fetchGigs]);

  return {
    gigs: visibleGigs,
    finishedGigs,
    selectedStatus,
    selectStatus,
    addGig,
    isExiting,
    isLoading,
    refreshGigs: fetchGigs
  };
}
