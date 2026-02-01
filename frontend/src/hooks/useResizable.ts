import { useEffect, useRef, useState } from "react";

interface UseResizableOptions {
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  storageKey?: string;
}

export function useResizable({
  minWidth = 320,
  maxWidth = window.innerWidth * 0.8,
  defaultWidth = 480,
  storageKey = "resizable-width",
}: UseResizableOptions = {}) {
  const [width, setWidth] = useState<number>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? Number(stored) : defaultWidth;
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        localStorage.setItem(storageKey, width.toString());
      }
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, width, minWidth, maxWidth, storageKey]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  return {
    width,
    isResizing,
    handleMouseDown,
    resizeRef,
  };
}
