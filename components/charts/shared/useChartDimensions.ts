import { useState, useEffect, useCallback, useRef } from "react";

export function useChartDimensions(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const rafId = useRef<number>(0);

  const updateDimensions = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = Math.min(width * 0.65, 500);
        setDimensions({ width, height });
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
