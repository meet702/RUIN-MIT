import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { rideService } from "../api/rideService";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import RideCard from "../components/rides/RideCard";
import PostRideModal from "../components/rides/PostRideModal";
import ListingSections from "../components/listings/ListingSections";
import Tag from "../components/ui/Tag";
import FilterPillGroup from "../components/ui/FilterPillGroup";
import { getCurrentUserId } from "../utils/ownership";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";
import { Car } from "lucide-react";

const VEHICLE_TYPES = ["All", "auto", "cab", "car", "bike", "other"];

export default function RidesPage() {
  const [rides, setRides] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId(user);

  const fetchRides = useCallback(async () => {
    setIsLoading(true);
    try {
      const vType = selectedVehicle === "All" ? null : selectedVehicle;
      // Fetch open and full rides by default
      const response = await rideService.getRides(null, vType, 0, 50);
      if (response.success) {
        setRides(response.data.content || []);
      }
    } catch (error) {
      console.error("Failed to fetch rides", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const handlePostClick = () => {
    if (!isAuthenticated) {
        navigate("/login", { state: { from: { pathname: "/rides" } } });
        return;
    }
    setIsModalOpen(true);
  };

  const addRide = async (data) => {
    try {
      const response = await rideService.createRide(data);
      if (response.success) {
        await fetchRides();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to post ride" };
    }
  };

  return (
    <main className="min-h-screen bg-ruin-background px-4 py-8 font-body text-ruin-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-5xl font-bold leading-none text-ruin-text sm:text-6xl lg:text-7xl">
              Rides
            </h1>
            <p className="mt-4 text-base text-gray-300 sm:text-lg">Share rides, split fare, save time.</p>
          </div>

          <Button className="sm:mt-2" variant="orange" onClick={handlePostClick}>
            + Offer a Ride
          </Button>
        </header>

        <FilterPillGroup>
          {VEHICLE_TYPES.map((type) => (
            <Tag
              key={type}
              active={selectedVehicle === type}
              className="capitalize"
              onClick={() => setSelectedVehicle(type)}
            >
              {type}
            </Tag>
          ))}
        </FilterPillGroup>
        
        {isLoading ? (
            <SkeletonCard count={6} />
        ) : rides.length === 0 ? (
            <EmptyState 
              icon={Car}
              title="No rides found"
              description="There are currently no rides available. Be the first to offer one!"
              actionLabel="+ Offer a Ride"
              onAction={handlePostClick}
            />
        ) : (
            <ListingSections
              items={rides}
              currentUserId={currentUserId}
              renderCard={(ride, i, isOwnPost) => (
                <RideCard key={ride.id} ride={ride} index={i} isOwnPost={isOwnPost} currentUser={user} />
              )}
            />
        )}
      </div>

      <PostRideModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addRide}
      />
    </main>
  );
}
