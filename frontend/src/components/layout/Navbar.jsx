import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import NavbarUserMenu from "./NavbarUserMenu";
import NotificationBell from "../NotificationBell";

const NAV_LINKS = [
  { name: "Gigs", path: "/gigs" },
  { name: "Rides", path: "/rides" },
  { name: "Marketplace", path: "/marketplace" },
  { name: "Flatmates", path: "/flatmates" },
  { name: "Lost & Found", path: "/lost-found" },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    // Replace so the user can't press Back into a stale authenticated page
    navigate("/", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-ruin-border bg-ruin-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-ruin-text">
            Ruin<span className="text-ruin-orange">MIT</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden flex-1 items-center justify-center space-x-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `font-heading text-sm font-semibold transition-colors ${
                  isActive || location.pathname.startsWith(link.path)
                    ? "text-ruin-orange"
                    : "text-ruin-muted hover:text-ruin-text"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <NavbarUserMenu user={user} onLogout={handleLogout} />
            </div>
          ) : (
            <>
              <Link to="/login" className="font-heading text-sm font-semibold text-ruin-text hover:text-ruin-orange transition-colors">
                Log In
              </Link>
              <Link to="/register">
                <Button variant="orange" className="py-2 px-4">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="text-ruin-text md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="border-t border-ruin-border bg-ruin-background px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `font-heading text-lg font-semibold ${
                    isActive || location.pathname.startsWith(link.path)
                      ? "text-ruin-orange"
                      : "text-ruin-text"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            
            <div className="my-4 border-t border-ruin-border"></div>
            
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-ruin-border bg-ruin-card p-3">
                  <span className="font-heading text-sm font-semibold text-ruin-text">Notifications</span>
                  <NotificationBell />
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg border border-ruin-border bg-ruin-card p-3"
                >
                  <Avatar name={user?.fullName || "User"} />
                  <div>
                    <p className="font-medium text-ruin-text">{user?.fullName}</p>
                    <p className="text-xs text-ruin-muted">{user?.email}</p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-ruin-border py-3 font-heading font-semibold text-ruin-magenta"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="orange" className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
