import { useState, useEffect, useCallback, useRef } from "react";

export function useChartDimensions(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const rafId = useRef<number>(0);

  const updateDimensions = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = Math.max(Math.min(width * 0.6, 500), 250);
        setDimensions((prev) => {
          if (prev.width === width && prev.height === height) return prev;
          return { width, height };
        });
      }
    });
  }, [containerRef]);

  useEffect(() => {
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [containerRef, updateDimensions]);

  return dimensions;
}
