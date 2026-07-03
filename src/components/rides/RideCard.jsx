import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { Bike, Car, CircleDot, MapPin } from "lucide-react";

function formatFare(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export default function RideCard({ ride, index, isOwnPost = false, currentUser = null }) {
  const accent = ride.status === "open" ? "#00C9A7" : ride.status === "full" ? "#F26522" : "#A78BFA";
  const [isHovered, setIsHovered] = useState(false);
  const posterName =
    (isOwnPost && currentUser?.fullName) ||
    ride.driverFullName ||
    ride.poster?.fullName ||
    "User";
  const availableSeats = Number(ride.availableSeats ?? ride.totalSeats ?? 0);

  const departureDate = new Date(ride.departureTime).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const departureTime = new Date(ride.departureTime).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getVehicleIcon = () => {
    switch (ride.vehicleType) {
      case "car":
        return <Car size={18} className="text-ruin-muted" />;
      case "bike":
        return <Bike size={18} className="text-ruin-muted" />;
      default:
        return <Car size={18} className="text-ruin-muted" />;
    }
  };

  return (
    <article
      className="gig-card-enter flex h-full flex-col rounded-xl border bg-ruin-card p-5 transition duration-200 ease-out"
      style={{
        animationDelay: `${index * 60}ms`,
        borderColor: isHovered ? `${accent}4D` : "#2A2A2A",
        borderLeftColor: isOwnPost ? "#F26522" : isHovered ? `${accent}4D` : "#2A2A2A",
        borderLeftWidth: isOwnPost ? "2px" : undefined,
        transform: isHovered ? "translateY(-3px)" : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 font-heading text-[11px] font-semibold tracking-[0.04em] capitalize"
          style={{
            backgroundColor: `${accent}1A`,
            color: accent,
          }}
        >
          {ride.status}
        </span>
        <div className="flex items-center gap-1.5 rounded border border-ruin-border bg-ruin-background px-2 py-1 text-xs font-medium text-ruin-muted">
          {getVehicleIcon()}
          <span className="capitalize">{ride.vehicleType}</span>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <CircleDot size={16} className="mt-1 shrink-0 text-ruin-orange" />
          <p className="font-heading text-base font-semibold leading-tight text-ruin-text line-clamp-2">
            {ride.fromLocation}
          </p>
        </div>
        <div className="my-0.5 ml-[7px] h-4 w-0.5 bg-ruin-border" />
        <div className="flex items-start gap-3">
          <MapPin size={16} className="mt-1 shrink-0 text-[#00C9A7]" />
          <p className="font-heading text-base font-semibold leading-tight text-ruin-text line-clamp-2">
            {ride.toLocation}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-ruin-border bg-ruin-background px-3 py-2">
          <p className="text-xs font-medium text-ruin-muted">{departureDate}</p>
          <p className="font-heading text-xl font-bold text-ruin-text">{departureTime}</p>
        </div>
        <div className="rounded-lg border border-ruin-border bg-ruin-background px-3 py-2 text-right">
          <p className="text-xs font-medium text-ruin-muted">Seats</p>
          <p className="font-heading text-xl font-bold text-ruin-text">
            {availableSeats} <span className="text-sm text-ruin-muted">/ {ride.totalSeats}</span>
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-ruin-border pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={posterName} accent={accent} />
          <p className="truncate text-sm text-ruin-muted">{posterName}</p>
        </div>
        {Number(ride.farePerPerson) > 0 && (
          <div className="shrink-0 text-right">
            <p className="font-heading text-lg font-bold text-[#00C9A7]">
              {"\u20B9"}{formatFare(ride.farePerPerson)}
            </p>
            <p className="text-[11px] font-medium text-ruin-muted">
              per person
            </p>
          </div>
        )}
      </div>

      <Link
        to={`/rides/${ride.id}`}
        className="mt-5 block w-full rounded-lg border px-4 py-3 text-center font-heading text-sm font-semibold transition-colors"
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
