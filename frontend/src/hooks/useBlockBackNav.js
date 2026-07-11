import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Blocks the browser back button while the user is authenticated.
 *
 * Strategy: push a duplicate entry onto the history stack so there is always
 * a "forward" slot available, then re-push it every time the user tries to
 * go back (popstate).  This keeps the user on their current page and makes
 * back-navigation a no-op — effectively graying out the back button once
 * they exhaust the injected entries.
 *
 * Call this hook once inside AppShell (or any always-mounted component that
 * wraps the authenticated portion of the app).
 */
export function useBlockBackNav() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Push a duplicate so there is an extra history entry the browser can
    // try to go "back" through before leaving the app.
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // The user pressed back — push them forward again.
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isAuthenticated, navigate]);
}
