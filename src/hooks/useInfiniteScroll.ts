import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for detecting when user scrolls near the bottom of a scrollable container
 * Uses Intersection Observer for performance
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  hasNextPage: boolean,
  isLoading: boolean = false,
  threshold: number = 200 // pixels from bottom
) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      // If sentinel is intersecting (visible) and we have more pages and not loading
      if (entry.isIntersecting && hasNextPage && !isLoading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasNextPage, isLoading]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // viewport
      rootMargin: `${threshold}px`, // trigger when threshold pixels from bottom
      threshold: 0.1, // trigger when 10% of sentinel is visible
    });

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [handleIntersection, threshold]);

  return sentinelRef;
}
