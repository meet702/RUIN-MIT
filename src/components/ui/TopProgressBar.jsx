import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * TopProgressBar — thin animated bar at the top of the viewport
 * that fires on every route change (similar to YouTube / GitHub).
 */
export default function TopProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Start the bar
    setVisible(true);
    setProgress(0);

    // Quick burst to ~30%
    const t1 = setTimeout(() => setProgress(30), 10);
    // Ease to ~70%
    const t2 = setTimeout(() => setProgress(70), 150);
    // Finish to 100%
    const t3 = setTimeout(() => setProgress(100), 350);
    // Hide after animation completes
    const t4 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 600);

    timeoutRef.current = [t1, t2, t3, t4];

    return () => {
      timeoutRef.current?.forEach(clearTimeout);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none">
      <div
        className="top-progress-bar h-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
