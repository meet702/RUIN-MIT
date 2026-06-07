import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

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
      // Backend successful, now navigate to verify email
      navigate("/verify-email", { state: { email } });
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
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none transition focus:border-ruin-orange"
              placeholder="••••••••"
              minLength={8}
            />
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
