import { useState, useEffect } from 'react';

/**
 * Hook to detect scroll position
 * Returns true when scrolled past a threshold (default: 100px)
 * Uses Intersection Observer for performance
 */
export function useScrollPosition(threshold: number = 100): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Create a sentinel element at the top to observe
    const sentinel = document.createElement('div');
    sentinel.style.position = 'absolute';
    sentinel.style.top = `${threshold}px`;
    sentinel.style.left = '0';
    sentinel.style.width = '1px';
    sentinel.style.height = '1px';
    sentinel.style.pointerEvents = 'none';
    sentinel.style.visibility = 'hidden';
    document.body.appendChild(sentinel);

    // Use Intersection Observer to detect when sentinel is out of view
    const observer = new IntersectionObserver(
      (entries) => {
        // When sentinel is not intersecting, we've scrolled past threshold
        setIsScrolled(!entries[0].isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (document.body.contains(sentinel)) {
        document.body.removeChild(sentinel);
      }
    };
  }, [threshold]);

  return isScrolled;
}
