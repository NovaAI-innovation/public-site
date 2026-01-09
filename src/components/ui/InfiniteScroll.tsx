import React, { useEffect, useRef, useCallback } from 'react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  rootMargin?: string; // Intersection Observer root margin
  className?: string;
}

/**
 * Infinite scroll component using Intersection Observer
 * Automatically triggers onLoadMore when user scrolls near the bottom
 */
export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  rootMargin = '0px 0px 200px 0px',
  className = '',
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // viewport
      rootMargin,
      threshold: 0.1,
    });

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [handleIntersection, rootMargin]);

  return (
    <div className={className}>
      {children}

      {/* Sentinel element for intersection observer */}
      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="infinite-scroll-sentinel h-4 flex items-center justify-center"
          aria-hidden="true"
        >
          {isFetchingNextPage && (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};