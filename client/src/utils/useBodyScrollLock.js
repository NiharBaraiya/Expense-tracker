import { useEffect } from "react";

// Locks body scroll while a component is mounted; restores on unmount.
export default function useBodyScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const prevOverflow = document.body.style.overflow;

    // Avoid layout shift when hiding scrollbar
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow || "";
      document.body.style.paddingRight = prevPaddingRight || "";
    };
  }, [enabled]);
}
