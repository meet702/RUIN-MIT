import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rideService } from "../api/rideService";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import ChatButton from "../components/chat/ChatButton";
import PostRideModal from "../components/rides/PostRideModal";
import { CircleDot, MapPin, Calendar, Clock, Info } from "lucide-react";

export default function RideDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [ride, setRide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchRide = async () => {
    setIsLoading(true);
    try {
      const response = await rideService.getRideDetails(id);
      if (response.success) {
        setRide(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load ride details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
  }, [id]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/rides/${id}` } } });
      return;
    }

    setIsBooking(true);
    setBookingError("");

    try {
      const response = await rideService.bookRide(id);
      if (response.success) {
        await fetchRide();
      } else {
        setBookingError(response.message || "Failed to book ride");
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || "Failed to book ride");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (window.confirm("Are you sure you want to cancel your booking?")) {
        try {
            const response = await rideService.cancelBooking(id);
            if (response.success) {
                await fetchRide();
            } else {
                alert(response.message || "Failed to cancel");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel");
        }
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await rideService.updateRideStatus(id, newStatus);
      if (response.success) {
        await fetchRide();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleEditRide = async (data) => {
    try {
      const response = await rideService.updateRide(id, data);
      if (response.success) {
        await fetchRide();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update ride" };
    }
  };

  if (isLoading) return <div className="p-8 text-center text-ruin-muted">Loading ride...</div>;
  if (error || !ride) return <div className="p-8 text-center text-ruin-magenta">{error || "Ride not found"}</div>;

  const driverId = ride.driverId || ride.poster?.id;
  const driverName = ride.driverFullName || ride.poster?.fullName;
  const isOwner = user?.id && driverId && String(user.id) === String(driverId);
  const isPassenger = ride.passengers?.some(p => p.id === user?.id);
  const accent = ride.status === "open" ? "#00C9A7" : ride.status === "full" ? "#F26522" : "#A78BFA";

  const departureDate = new Date(ride.departureTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const departureTime = new Date(ride.departureTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 font-body">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-ruin-muted hover:text-ruin-text transition-colors">
          &larr; Back
        </button>
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={() => setIsEditModalOpen(true)} className="text-sm font-medium text-ruin-text px-3 py-1 border border-ruin-border rounded-md hover:border-ruin-orange hover:text-ruin-orange transition-colors">Edit</button>
            {(ride.status === "open" || ride.status === "full") && (
                <>
                    <button onClick={() => handleStatusUpdate("completed")} className="text-sm font-medium text-ruin-background bg-[#00C9A7] px-3 py-1 rounded-md">Mark Completed</button>
                    <button onClick={() => handleStatusUpdate("cancelled")} className="text-sm font-medium text-ruin-magenta px-3 py-1 border border-ruin-magenta rounded-md hover:bg-ruin-magenta/10">Cancel Ride</button>
                </>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <span className="inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.04em] capitalize" style={{ backgroundColor: `${accent}1A`, color: accent }}>
                        {ride.status}
                    </span>
                    <span className="text-sm font-medium uppercase text-ruin-muted border border-ruin-border px-2 py-0.5 rounded capitalize">
                        {ride.vehicleType}
                    </span>
                </div>

                <div className="flex flex-col gap-6 relative">
                    <div className="absolute left-3.5 top-8 bottom-8 w-0.5 bg-ruin-border hidden sm:block"></div>
                    
                    <div className="flex items-start gap-4">
                        <div className="bg-ruin-background border border-ruin-border w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 hidden sm:flex">
                            <CircleDot size={14} className="text-ruin-orange" />
                        </div>
                        <div>
                            <p className="text-sm text-ruin-muted uppercase font-medium tracking-wider mb-1">Pick up</p>
                            <h2 className="font-heading text-xl sm:text-2xl font-bold text-ruin-text">{ride.fromLocation}</h2>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                        <div className="bg-ruin-background border border-ruin-border w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 hidden sm:flex">
                            <MapPin size={14} className="text-[#00C9A7]" />
                        </div>
                        <div>
                            <p className="text-sm text-ruin-muted uppercase font-medium tracking-wider mb-1">Drop off</p>
                            <h2 className="font-heading text-xl sm:text-2xl font-bold text-ruin-text">{ride.toLocation}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8">
                <h3 className="text-lg font-heading font-bold text-ruin-text mb-6">Ride Details</h3>
                
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                        <Calendar className="text-ruin-muted shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-ruin-muted uppercase">Date</p>
                            <p className="mt-1 text-ruin-text">{departureDate}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Clock className="text-ruin-muted shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-ruin-muted uppercase">Time</p>
                            <p className="mt-1 text-ruin-text">{departureTime}</p>
                        </div>
                    </div>
                </div>

                {ride.notes && (
                    <div className="mt-6 pt-6 border-t border-ruin-border flex items-start gap-3">
                        <Info className="text-ruin-muted shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-ruin-muted uppercase">Notes from driver</p>
                            <p className="mt-1 text-ruin-text whitespace-pre-wrap">{ride.notes}</p>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8">
                <h3 className="text-lg font-heading font-bold text-ruin-text mb-6">Driver</h3>
                <div className="flex items-center gap-4">
                    <Avatar name={driverName} />
                    <div>
                        <p className="text-ruin-text font-medium">{driverName}</p>
                        {isPassenger && <p className="text-sm text-[#00C9A7]">You are traveling together</p>}
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-6">
              <div className="rounded-2xl border border-ruin-border bg-ruin-card p-6 h-fit text-center">
                  <p className="text-sm font-medium text-ruin-muted uppercase tracking-wider mb-2">Contribution per person</p>
                  <p className="font-heading text-5xl font-bold text-ruin-text mb-6">
                      ₹{ride.farePerPerson || 0}
                  </p>

                  <div className="py-4 border-y border-ruin-border mb-6">
                      <p className="text-ruin-muted mb-1">Seats Available</p>
                      <p className="font-heading text-2xl font-bold text-ruin-text">{ride.availableSeats} <span className="text-sm text-ruin-muted font-normal">/ {ride.totalSeats}</span></p>
                  </div>

                  {!isOwner && (
                      <>
                          {isPassenger ? (
                              <div>
                                  <div className="py-3 px-4 rounded-lg border border-[#00C9A7]/30 bg-[#00C9A7]/10 text-[#00C9A7] font-medium mb-3">
                                      You have booked a seat!
                                  </div>
                                  <button onClick={handleCancelBooking} className="text-sm font-medium text-ruin-magenta hover:underline">
                                      Cancel Booking
                                  </button>
                              </div>
                          ) : ride.status === "open" ? (
                              <div>
                                  {bookingError && <p className="mb-2 text-sm text-ruin-magenta">{bookingError}</p>}
                                  <Button onClick={handleBook} variant="orange" className="w-full" disabled={isBooking}>
                                      {isBooking ? "Booking..." : "Book a Seat"}
                                  </Button>
                              </div>
                          ) : (
                              <div className="py-3 px-4 rounded-lg border border-ruin-border bg-ruin-background text-ruin-muted font-medium">
                                  {ride.status === "full" ? "Ride is full" : `Ride is ${ride.status}`}
                              </div>
                          )}
                      </>
                  )}
                  
                  {isOwner && (
                      <div className="py-3 px-4 rounded-lg border border-ruin-border bg-ruin-background text-ruin-text font-medium">
                          You are the driver
                      </div>
                  )}

                  {!isOwner && isPassenger && (
                      <div className="mt-4 pt-4 border-t border-ruin-border">
                          <ChatButton
                              otherUserId={driverId}
                              otherUserName={driverName}
                              referenceType="ride"
                              referenceId={ride.id}
                              buttonText="Chat with driver"
                          />
                      </div>
                  )}
              </div>

              {(isOwner || isPassenger) && ride.passengers && ride.passengers.length > 0 && (
                  <div className="rounded-2xl border border-ruin-border bg-ruin-card p-6">
                      <h3 className="text-base font-heading font-bold text-ruin-text mb-4">Passengers ({ride.passengers.length})</h3>
                      <div className="space-y-3">
                          {ride.passengers.map(p => (
                              <div key={p.id} className="flex items-center gap-3">
                                  <Avatar name={p.fullName} />
                                  <span className="text-sm text-ruin-text font-medium">{p.fullName} {p.id === user?.id ? "(You)" : ""}</span>
                                  {isOwner && p.id !== user?.id && (
                                      <ChatButton
                                          otherUserId={p.id}
                                          otherUserName={p.fullName}
                                          referenceType="ride"
                                          referenceId={ride.id}
                                          buttonText="Chat"
                                      />
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>

      <PostRideModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditRide}
        initialData={ride}
        mode="edit"
      />
    </div>
  );
}
