import { useCallback, useState, useEffect } from "react";
import { gigService } from "../api/gigService";

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

export function useGigs() {
  const [gigs, setGigs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("open");
  const [isExiting, setIsExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGigs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch open gigs from backend
      const response = await gigService.getOpenGigs(0, 50);
      if (response.success) {
        setGigs(response.data.content || []);
      }
    } catch (error) {
      console.error("Failed to fetch gigs", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    selectedStatus,
    selectStatus,
    addGig,
    isExiting,
    isLoading,
    refreshGigs: fetchGigs
  };
}
