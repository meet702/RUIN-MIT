import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, MapPin, DollarSign, Tag, Users, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import NavbarUserMenu from "../components/layout/NavbarUserMenu";
import NotificationBell from "../components/NotificationBell";

// Content data for feature sections
const features = [
  {
    id: "gigs",
    eyebrow: "Gigs",
    title: "Get Things Done, Get Paid",
    description:
      "Post or pick up small paid tasks from fellow students — assignments, errands, tutoring, design work, whatever you need help with or can help others with. A simple way to earn a little extra or get unstuck when you're short on time.",
    Icon: DollarSign,
    mockup: (
      <div className="flex flex-col gap-3 rounded-xl border border-ruin-border bg-ruin-card p-5 shadow-lg w-3/4 mx-auto rotate-1 hover:rotate-0 transition-transform">
        <div className="flex justify-between items-start">
          <div className="h-6 w-3/4 bg-ruin-border rounded animate-pulse"></div>
          <span className="font-heading font-bold text-ruin-orange">₹500</span>
        </div>
        <div className="h-4 w-1/2 bg-ruin-border/50 rounded mt-2"></div>
        <div className="h-4 w-full bg-ruin-border/30 rounded mt-1"></div>
        <div className="flex gap-2 mt-4">
          <span className="px-2 py-1 bg-ruin-background rounded text-xs text-ruin-muted border border-ruin-border">Urgent</span>
          <span className="px-2 py-1 bg-ruin-background rounded text-xs text-ruin-muted border border-ruin-border">Design</span>
        </div>
      </div>
    ),
  },
  {
    id: "rides",
    eyebrow: "Rides",
    title: "Never Travel Alone",
    description:
      "Share rides to and from campus, the station, or anywhere in between. Split the fare, save money, and make the commute a little less lonely — posted by students, for students.",
    Icon: MapPin,
    mockup: (
      <div className="flex flex-col gap-4 rounded-xl border border-ruin-border bg-ruin-card p-5 shadow-lg w-3/4 mx-auto -rotate-2 hover:rotate-0 transition-transform">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ruin-orange/20 rounded-full flex items-center justify-center">
            <MapPin className="text-ruin-orange" size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-ruin-text">MIT-WPU to Pune Station</div>
            <div className="text-xs text-ruin-muted mt-1">Today, 5:30 PM • 2 seats left</div>
          </div>
        </div>
        <div className="h-[2px] w-full bg-ruin-border border-dashed border-t"></div>
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-ruin-card bg-ruin-border"></div>
            <div className="w-8 h-8 rounded-full border-2 border-ruin-card bg-ruin-muted"></div>
          </div>
          <span className="font-heading font-bold text-ruin-text">₹150 <span className="text-xs text-ruin-muted font-body">/seat</span></span>
        </div>
      </div>
    ),
  },
  {
    id: "marketplace",
    eyebrow: "Marketplace",
    title: "Buy, Sell, Save",
    description:
      "Cycles, textbooks, furniture, electronics — the stuff you only need for a semester shouldn't go to waste. Buy secondhand from people on campus, or sell what you no longer need, without ever leaving MIT-WPU.",
    Icon: Tag,
    mockup: (
      <div className="grid grid-cols-2 gap-3 w-4/5 mx-auto">
        <div className="rounded-xl border border-ruin-border bg-ruin-card p-3 shadow-lg rotate-2 hover:rotate-0 transition-transform">
          <div className="aspect-square w-full bg-ruin-border/40 rounded-lg mb-3 flex items-center justify-center">
            <Tag className="text-ruin-muted/50" size={32} />
          </div>
          <div className="h-4 w-3/4 bg-ruin-border rounded"></div>
          <div className="font-heading font-bold text-ruin-orange mt-2">₹4,500</div>
        </div>
        <div className="rounded-xl border border-ruin-border bg-ruin-card p-3 shadow-lg -rotate-1 hover:rotate-0 transition-transform mt-4">
          <div className="aspect-square w-full bg-ruin-border/40 rounded-lg mb-3 flex items-center justify-center">
            <Tag className="text-ruin-muted/50" size={32} />
          </div>
          <div className="h-4 w-3/4 bg-ruin-border rounded"></div>
          <div className="font-heading font-bold text-ruin-orange mt-2">₹800</div>
        </div>
      </div>
    ),
  },
  {
    id: "flatmates",
    eyebrow: "Flatmates",
    title: "Find Your People",
    description:
      "Looking for a place near campus, or a flatmate to share one with? Browse listings from other students, filter by budget and preferences, and find someone (and somewhere) that actually fits your life.",
    Icon: Users,
    mockup: (
      <div className="flex flex-col gap-3 rounded-xl border border-ruin-border bg-ruin-card p-5 shadow-lg w-3/4 mx-auto rotate-1 hover:rotate-0 transition-transform">
        <div className="flex gap-4 items-start">
          <div className="w-16 h-16 rounded-lg bg-ruin-border/40 shrink-0"></div>
          <div className="w-full">
            <div className="h-5 w-full bg-ruin-border rounded"></div>
            <div className="h-4 w-2/3 bg-ruin-border/50 rounded mt-2"></div>
            <div className="flex gap-2 mt-3">
              <span className="px-2 py-1 bg-ruin-background rounded text-xs text-ruin-muted border border-ruin-border">Male</span>
              <span className="px-2 py-1 bg-ruin-background rounded text-xs text-ruin-muted border border-ruin-border">Veg</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "lostfound",
    eyebrow: "Lost & Found",
    title: "Nothing Stays Lost for Long",
    description:
      "Lost your ID card on the bus, or found someone's earphones in the library? Post it here so it finds its way back — a shared lost-and-found board for the whole campus.",
    Icon: Search,
    mockup: (
      <div className="flex flex-col gap-3 rounded-xl border border-ruin-border bg-ruin-card p-5 shadow-lg w-3/4 mx-auto -rotate-2 hover:rotate-0 transition-transform">
        <div className="flex justify-between items-center mb-2">
          <span className="px-3 py-1 bg-ruin-magenta/10 text-ruin-magenta rounded-full text-xs font-semibold">LOST</span>
          <span className="text-xs text-ruin-muted">2 hours ago</span>
        </div>
        <div className="h-6 w-3/4 bg-ruin-border rounded"></div>
        <div className="flex items-center gap-2 mt-2">
          <MapPin size={14} className="text-ruin-muted" />
          <div className="h-4 w-1/2 bg-ruin-border/50 rounded"></div>
        </div>
      </div>
    ),
  },
];

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect authenticated users straight to the app — replace() removes
  // the landing page from history so the back button won't return here.
  if (isAuthenticated) {
    return <Navigate to="/gigs" replace />;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-ruin-background text-ruin-text overflow-x-hidden selection:bg-ruin-orange/30">
      {/* Landing Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-ruin-border bg-ruin-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-ruin-text">
              Ruin<span className="text-ruin-orange">MIT</span>
            </span>
          </Link>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <NavbarUserMenu user={user} onLogout={handleLogout} />
                <Button variant="orange" className="py-2 px-4" onClick={() => navigate("/gigs")}>
                  Go to App
                </Button>
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
            {isAuthenticated ? (
              <div className="space-y-4">
                <Button variant="orange" className="w-full" onClick={() => navigate("/gigs")}>Go to App</Button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full rounded-lg border border-ruin-border py-3 font-heading font-semibold text-ruin-magenta"
                >
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
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 px-4 mx-auto max-w-7xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Everything you need on campus. <br className="hidden md:block" />
            <span className="text-ruin-orange">In one place.</span>
          </h1>
          <p className="text-lg md:text-xl text-ruin-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            RuinMIT exists to make everyday student life at MIT-WPU simpler — whether that's earning money, getting around, saving on essentials, finding a place to live, or getting your stuff back. One platform, built by and for students.
          </p>
          <Button variant="orange" className="px-8 py-4 text-lg rounded-xl shadow-lg shadow-ruin-orange/20" onClick={() => navigate("/gigs")}>
            Get Started
          </Button>
        </motion.div>
      </section>

      {/* Feature Sections */}
      <section className="px-4 pb-32">
        <div className="max-w-7xl mx-auto space-y-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={feature.id} 
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${isEven ? "" : "lg:flex-row-reverse"}`}
              >
                {/* Visual Side */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="w-full lg:w-1/2"
                >
                  <div className="relative w-full aspect-[4/3] rounded-2xl bg-ruin-card/50 border border-ruin-border/50 flex items-center justify-center overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-ruin-orange/5 to-transparent opacity-50"></div>
                    {/* Mockup Content */}
                    <div className="relative z-10 w-full">
                      {feature.mockup}
                    </div>
                  </div>
                </motion.div>

                {/* Text Side */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full lg:w-1/2 space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ruin-card border border-ruin-border text-xs font-bold uppercase tracking-wider text-ruin-orange">
                    <feature.Icon size={14} />
                    {feature.eyebrow}
                  </div>
                  <h2 className="font-heading text-4xl lg:text-5xl font-bold tracking-tight">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-ruin-muted leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 border-t border-ruin-border bg-ruin-card/30 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ruin-orange/10 via-ruin-background to-ruin-background"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to dive in?
          </h2>
          <p className="text-lg text-ruin-muted mb-10 max-w-xl mx-auto">
            Join thousands of MIT-WPU students already using RuinMIT to navigate campus life.
          </p>
          <Button variant="orange" className="px-8 py-4 text-lg rounded-xl shadow-lg shadow-ruin-orange/20" onClick={() => navigate("/gigs")}>
            Get Started
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
