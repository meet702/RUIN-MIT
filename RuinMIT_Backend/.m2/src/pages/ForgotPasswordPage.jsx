import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../api/authService";
import Button from "../components/ui/Button";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        navigate("/reset-password", { state: { email } });
      } else {
        setError(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please check your email and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ruin-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-ruin-border bg-ruin-card p-8">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <span className="font-heading text-3xl font-bold tracking-tight text-ruin-text">
              Ruin<span className="text-ruin-orange">MIT</span>
            </span>
          </Link>
          <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-ruin-orange/10 border border-ruin-orange/20">
            <Mail className="h-7 w-7 text-ruin-orange" />
          </div>
          <h1 className="mt-5 font-heading text-2xl font-bold text-ruin-text">
            Forgot password?
          </h1>
          <p className="mt-2 text-sm text-ruin-muted">
            No worries! Enter your college email and we'll send you a verification code to reset
            your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-ruin-magenta/10 p-4 text-sm text-ruin-magenta border border-ruin-magenta/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-ruin-text">College Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none transition focus:border-ruin-orange"
              placeholder="name@mitwpu.edu.in"
            />
          </label>

          <Button type="submit" variant="orange" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send Verification Code"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-ruin-muted hover:text-ruin-text transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
