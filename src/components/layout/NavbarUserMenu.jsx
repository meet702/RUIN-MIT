import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import Avatar from "../ui/Avatar";

export default function NavbarUserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/5 focus:outline-none"
      >
        <span className="text-sm font-medium text-ruin-text">{user?.fullName}</span>
        <Avatar name={user?.fullName || "User"} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-ruin-border bg-ruin-card p-2 shadow-xl animate-fade-in origin-top-right">
          <Link 
            to="/profile" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ruin-text hover:bg-white/5 transition-colors"
          >
            <User size={16} />
            Profile
          </Link>
          <div className="my-1 border-t border-ruin-border/50"></div>
          <button 
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ruin-magenta hover:bg-ruin-magenta/10 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
