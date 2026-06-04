import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../api/authService";
import Button from "../components/ui/Button";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await authService.verifyEmail(email, otp);
      if (response.success) {
        setSuccess("Email verified successfully! You can now log in.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(response.message || "Verification failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const response = await authService.resendOtp(email);
      if (response.success) {
        setSuccess("A new OTP has been sent to your email.");
      } else {
        setError(response.message || "Failed to resend OTP");
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
          <h1 className="mt-6 font-heading text-2xl font-bold text-ruin-text">Verify your email</h1>
          <p className="mt-2 text-sm text-ruin-muted">
            We sent a verification code to <span className="font-medium text-ruin-text">{email}</span>
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

          <Button type="submit" variant="orange" className="w-full mt-2" disabled={isLoading || otp.length < 4}>
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={handleResend}
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
