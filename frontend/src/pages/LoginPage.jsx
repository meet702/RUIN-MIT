import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/gigs";

  // Auth guard: already logged in → go straight to the app
  if (!authLoading && isAuthenticated) {
    return <Navigate to="/gigs" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ruin-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-ruin-border bg-ruin-card p-8">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <span className="font-heading text-3xl font-bold tracking-tight text-ruin-text">
              Ruin<span className="text-ruin-orange">MIT</span>
            </span>
          </Link>
          <h1 className="mt-6 font-heading text-2xl font-bold text-ruin-text">Welcome back</h1>
          <p className="mt-2 text-sm text-ruin-muted">Log in to access campus features</p>
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

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none transition focus:border-ruin-orange"
              placeholder="••••••••"
            />
          </label>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-ruin-orange hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" variant="orange" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-ruin-muted">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-ruin-orange hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
