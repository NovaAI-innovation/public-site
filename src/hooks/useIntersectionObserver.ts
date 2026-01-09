import { useEffect, useRef, useState } from 'react';

/**
 * Hook for detecting when an element enters the viewport using Intersection Observer
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<Element>, boolean] {
  const elementRef = useRef<Element>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        root: null, // viewport
        rootMargin: '200px', // preload 200px before entering viewport
        threshold: 0.1, // trigger when 10% visible
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [elementRef, isIntersecting];
}

/**
 * Hook for lazy loading images with Intersection Observer
 * Returns a ref and loading state
 */
export function useLazyImage(
  src: string,
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLImageElement>, string | undefined, boolean] {
  const [ref, isIntersecting] = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.1,
    ...options,
  });

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isIntersecting && !imageSrc) {
      setIsLoading(true);
      // Create a new image to preload
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
      };
      img.onerror = () => {
        setIsLoading(false);
      };
      img.src = src;
    }
  }, [isIntersecting, src, imageSrc]);

  return [ref as React.RefObject<HTMLImageElement>, imageSrc, isLoading];
}