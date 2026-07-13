import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Auth guard: already logged in → go straight to the app
  if (!authLoading && isAuthenticated) {
    return <Navigate to="/gigs" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email.endsWith("@mitwpu.edu.in")) {
      setError("Please use a valid @mitwpu.edu.in college email");
      return;
    }

    setIsLoading(true);

    try {
      await register(fullName, email, password);
      // Use replace so /register is removed from history
      navigate("/verify-email", { replace: true, state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
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
          <h1 className="mt-6 font-heading text-2xl font-bold text-ruin-text">Create an account</h1>
          <p className="mt-2 text-sm text-ruin-muted">Join the exclusive campus marketplace</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-ruin-magenta/10 p-4 text-sm text-ruin-magenta border border-ruin-magenta/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Full Name</span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none transition focus:border-ruin-orange"
              placeholder="John Doe"
              minLength={2}
            />
          </label>

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
            <p className="mt-1 text-xs text-ruin-muted">Must be an @mitwpu.edu.in address</p>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 pr-12 text-ruin-text outline-none transition focus:border-ruin-orange"
                placeholder="••••••••"
                minLength={8}
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

          <Button type="submit" variant="orange" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-ruin-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-ruin-orange hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
