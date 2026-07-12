import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CircleHelp,
  KeyRound,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { authService } from "../api/authService";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";

const SUPPORT_EMAIL = "ruinmit69@gmail.com";

function ProfileAction({ as: Component = Link, icon: Icon, title, description, className = "", ...props }) {
  return (
    <Component
      className={`group flex items-center gap-4 rounded-lg border border-ruin-border bg-ruin-card p-4 text-left transition hover:border-ruin-orange/70 hover:bg-ruin-background ${className}`}
      {...props}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ruin-orange/25 bg-ruin-orange/10 text-ruin-orange">
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-base font-semibold text-ruin-text">{title}</span>
        <span className="mt-1 block text-sm text-ruin-muted">{description}</span>
      </span>
      <ArrowRight size={18} className="shrink-0 text-ruin-muted transition group-hover:text-ruin-orange" />
    </Component>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resetStatus, setResetStatus] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async () => {
    if (!user?.email) {
      setResetError("We could not find your email for password reset.");
      return;
    }

    setIsResetting(true);
    setResetStatus("");
    setResetError("");

    try {
      const response = await authService.forgotPassword(user.email);
      if (response.success) {
        setResetStatus("OTP sent. Opening reset password page...");
        navigate("/reset-password", { state: { email: user.email } });
      } else {
        setResetError(response.message || "Could not start password reset.");
      }
    } catch (error) {
      setResetError(error.response?.data?.message || "Could not start password reset.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Student";

  return (
    <main className="min-h-screen bg-ruin-background px-4 py-8 text-ruin-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-ruin-border bg-ruin-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-ruin-orange/35 bg-ruin-orange/10">
                <Avatar name={user?.fullName || "User"} />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold text-ruin-text">{user?.fullName || "User"}</h1>
                <p className="mt-1 text-sm text-ruin-muted">{user?.email}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-ruin-orange/25 bg-ruin-orange/10 px-3 py-1 text-xs font-semibold text-ruin-orange">
                  <ShieldCheck size={14} />
                  {role} account
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 border-ruin-magenta/40 text-ruin-magenta">
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <ProfileAction
            as="a"
            href={`mailto:${user?.email || ""}`}
            icon={Mail}
            title="College Email"
            description={user?.email || "No email saved"}
          />
          <ProfileAction
            as="a"
            href={`mailto:${SUPPORT_EMAIL}?subject=RuinMIT%20Account%20Help`}
            icon={ShieldCheck}
            title="Account Help"
            description="Get help with login, verification, or your account."
          />
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 font-heading text-xl font-bold text-ruin-text">Account</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResetting}
                className="group flex w-full items-center gap-4 rounded-lg border border-ruin-border bg-ruin-card p-4 text-left transition hover:border-ruin-orange/70 hover:bg-ruin-background disabled:opacity-60"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ruin-orange/25 bg-ruin-orange/10 text-ruin-orange">
                  <KeyRound size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-base font-semibold text-ruin-text">
                    {isResetting ? "Sending OTP..." : "Reset Password"}
                  </span>
                  <span className="mt-1 block text-sm text-ruin-muted">Send a reset code to your college email.</span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-ruin-muted transition group-hover:text-ruin-orange" />
              </button>
            </div>

            {(resetStatus || resetError) && (
              <p className={`mt-4 rounded-lg border p-3 text-sm ${resetError ? "border-ruin-magenta/30 bg-ruin-magenta/10 text-ruin-magenta" : "border-ruin-orange/30 bg-ruin-orange/10 text-ruin-orange"}`}>
                {resetError || resetStatus}
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-heading text-xl font-bold text-ruin-text">Help</h2>
            <div className="space-y-3">
              <ProfileAction
                as="a"
                href={`mailto:${SUPPORT_EMAIL}?subject=RuinMIT%20Support%20Request`}
                icon={LifeBuoy}
                title="Help & Support"
                description={SUPPORT_EMAIL}
              />
              <ProfileAction
                as="a"
                href={`mailto:${SUPPORT_EMAIL}?subject=RuinMIT%20Feedback&body=Hi%20RuinMIT%20team%2C%0A%0AI%20would%20like%20to%20suggest%3A%0A`}
                icon={MessageSquareText}
                title="Send Feedback"
                description="Suggest changes, bugs, or improvements."
              />
              <ProfileAction
                as="a"
                href={`mailto:${SUPPORT_EMAIL}?subject=RuinMIT%20Report%20a%20Problem`}
                icon={CircleHelp}
                title="Report a Problem"
                description="Tell us if something feels broken or confusing."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
