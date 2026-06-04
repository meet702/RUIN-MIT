import { useCallback, useState, useEffect } from "react";
import { gigService } from "../api/gigService";

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
        await fetchGigs();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error("Failed to post gig", error);
      return { success: false, message: error.response?.data?.message || "Failed to post gig" };
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
