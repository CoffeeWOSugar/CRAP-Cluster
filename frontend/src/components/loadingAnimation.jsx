import { useEffect, useState } from "react";

export default function useAnimatedDots(
  isActive,
  maxDots = 3,
  intervalMs = 500
) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isActive) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => (prev.length < maxDots ? prev + "." : ""));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isActive, maxDots, intervalMs]);

  return dots;
}