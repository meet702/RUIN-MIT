import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { Car, Bike, CircleDot, MapPin } from "lucide-react";

export default function RideCard({ ride, index }) {
  const accent = ride.status === "open" ? "#00C9A7" : ride.status === "full" ? "#F26522" : "#A78BFA";
  const [isHovered, setIsHovered] = useState(false);

  const departureDate = new Date(ride.departureTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const departureTime = new Date(ride.departureTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const getVehicleIcon = () => {
      switch (ride.vehicleType) {
          case "car": return <Car size={20} className="text-ruin-muted" />;
          case "bike": return <Bike size={20} className="text-ruin-muted" />;
          default: return <Car size={20} className="text-ruin-muted" />;
      }
  };

  return (
    <article
      className="gig-card-enter rounded-xl border bg-ruin-card p-5 transition duration-200 ease-out flex flex-col h-full"
      style={{
        animationDelay: `${index * 60}ms`,
        borderColor: isHovered ? `${accent}4D` : "#2A2A2A",
        transform: isHovered ? "translateY(-3px)" : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-4 flex justify-between items-start">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.04em] capitalize"
          style={{
            backgroundColor: `${accent}1A`,
            color: accent,
          }}
        >
          {ride.status}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-ruin-muted font-medium bg-ruin-background px-2 py-1 rounded border border-ruin-border">
            {getVehicleIcon()}
            <span className="capitalize">{ride.vehicleType}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-start gap-3">
              <CircleDot size={16} className="text-ruin-orange mt-1 shrink-0" />
              <p className="font-heading text-base font-semibold leading-tight text-ruin-text line-clamp-2">
                {ride.fromLocation}
              </p>
          </div>
          <div className="w-0.5 h-4 bg-ruin-border ml-[7px] my-0.5"></div>
          <div className="flex items-start gap-3">
              <MapPin size={16} className="text-[#00C9A7] mt-1 shrink-0" />
              <p className="font-heading text-base font-semibold leading-tight text-ruin-text line-clamp-2">
                {ride.toLocation}
              </p>
          </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-ruin-text">{departureDate}</p>
            <p className="text-lg font-bold text-ruin-text font-heading">{departureTime}</p>
        </div>
        <div className="text-right">
            <p className="text-sm font-medium text-ruin-muted">Seats</p>
            <p className="text-lg font-bold text-ruin-text font-heading">{ride.availableSeats} <span className="text-sm text-ruin-muted">/ {ride.totalSeats}</span></p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-ruin-border mt-auto">
        <div className="flex items-center gap-2">
            <Avatar name={ride.driverFullName} accent={accent} />
            <p className="text-sm text-ruin-muted line-clamp-1">{ride.driverFullName}</p>
        </div>
        {ride.farePerPerson > 0 && (
            <p className="font-heading text-lg font-bold text-[#00C9A7]">
                ₹{ride.farePerPerson}
            </p>
        )}
      </div>

      <Link
        to={`/rides/${ride.id}`}
        className="mt-5 w-full rounded-lg border px-4 py-3 font-heading text-sm font-semibold text-center block transition-colors"
        style={{
          borderColor: isHovered ? accent : "#2A2A2A",
          color: isHovered ? accent : "#E5E5E5",
          backgroundColor: isHovered ? `${accent}0A` : "transparent",
        }}
      >
        View Details
      </Link>
    </article>
  );
}
