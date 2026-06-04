import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../api/authService";
import Button from "../components/ui/Button";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword(email, otp, newPassword);
      if (response.success) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setError(response.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess("A new OTP has been sent to your email.");
      } else {
        setError(response.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP. Try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ruin-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-ruin-border bg-ruin-card p-8">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <span className="font-heading text-3xl font-bold tracking-tight text-ruin-text">
              Ruin<span className="text-ruin-orange">MIT</span>
            </span>
          </Link>
          <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
            <ShieldCheck className="h-7 w-7 text-green-500" />
          </div>
          <h1 className="mt-5 font-heading text-2xl font-bold text-ruin-text">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-ruin-muted">
            Enter the verification code sent to{" "}
            <span className="font-medium text-ruin-text">{email}</span> and choose a new password.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-ruin-magenta/10 p-4 text-sm text-ruin-magenta border border-ruin-magenta/20">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-sm text-green-500 border border-green-500/20">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Verification Code (OTP)</span>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-center font-heading text-2xl font-semibold tracking-widest text-ruin-text outline-none transition focus:border-ruin-orange"
              placeholder="000000"
              maxLength={6}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">New Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 pr-12 text-ruin-text outline-none transition focus:border-ruin-orange"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-ruin-muted hover:text-ruin-text transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Confirm New Password</span>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 pr-12 text-ruin-text outline-none transition focus:border-ruin-orange"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-ruin-muted hover:text-ruin-text transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <Button
            type="submit"
            variant="orange"
            className="w-full mt-2"
            disabled={isLoading || otp.length < 4}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-sm font-medium text-ruin-orange hover:underline disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Didn't receive a code? Resend"}
          </button>
        </div>
      </div>
    </div>
  );
}
