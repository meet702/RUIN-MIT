import { Briefcase, Car, Tag, Home, Search } from "lucide-react";

const TYPE_CONFIG = {
  gig:         { icon: Briefcase, color: "#F26522", label: "Gig" },
  ride:        { icon: Car,       color: "#3B82F6", label: "Ride" },
  marketplace: { icon: Tag,       color: "#A855F7", label: "Marketplace" },
  flatmate:    { icon: Home,      color: "#00C9A7", label: "Flatmate" },
  lost_found:  { icon: Search,    color: "#FACC15", label: "Lost & Found" },
};

export function getTypeConfig(referenceType) {
  return TYPE_CONFIG[referenceType] || { icon: Briefcase, color: "#7A7672", label: referenceType || "Chat" };
}

export default function ConversationTypeIcon({ referenceType, size = 16, className = "" }) {
  const { icon: Icon, color } = getTypeConfig(referenceType);

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md ${className}`}
      style={{ backgroundColor: `${color}1A`, color, width: size + 10, height: size + 10 }}
    >
      <Icon size={size} strokeWidth={2} />
    </div>
  );
}
