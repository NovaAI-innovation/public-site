import React, { useState, useRef, useEffect } from 'react';
import { getSrcSet, getSizesAttribute, getLQIPUrl } from '../../utils/cloudinary';

interface LazyImageProps {
  src: string;
  alt: string;
  cloudinaryPublicId?: string; // Cloudinary public ID for responsive optimization
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // For images that should load eagerly (above the fold)
  useLQIP?: boolean; // Whether to use Low Quality Image Placeholder
}

/**
 * Lazy loading image component using Intersection Observer
 * Only loads images when they enter the viewport for better performance
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  cloudinaryPublicId,
  className = '',
  placeholderClassName = '',
  onLoad,
  onError,
  priority = false,
  useLQIP = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Priority images start as in view
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return; // Don't observe if already loading or priority

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Stop observing once in view
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    // Only show error after 2 retries
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      // Force re-render by briefly hiding and showing the image
      setTimeout(() => {
        if (imgRef.current) {
          const currentSrc = imgRef.current.src;
          imgRef.current.src = '';
          imgRef.current.src = currentSrc;
        }
      }, 100);
      return;
    }

    setHasError(true);
    onError?.();
  };

  const handleRetry = () => {
    setHasError(false);
    setRetryCount(0);
    setIsLoaded(false);

    // Force reload the image
    if (imgRef.current) {
      const currentSrc = imgRef.current.src;
      imgRef.current.src = '';
      imgRef.current.src = currentSrc;
    }
  };

  // Generate LQIP URL if available
  const lqipUrl = cloudinaryPublicId && useLQIP ? getLQIPUrl(cloudinaryPublicId) : null;

  // Generate responsive image attributes
  const imgSrcSet = cloudinaryPublicId ? getSrcSet(cloudinaryPublicId) : undefined;
  const imgSizes = cloudinaryPublicId ? getSizesAttribute() : undefined;

  return (
    <div ref={containerRef} className={`lazy-image-container ${className}`}>
      {/* LQIP Placeholder */}
      {lqipUrl && !isLoaded && !hasError && (
        <img
          src={lqipUrl}
          alt=""
          className={`lazy-image-lqip absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 ${placeholderClassName}`}
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton (fallback when no LQIP) */}
      {!lqipUrl && !isLoaded && !hasError && (
        <div
          className={`lazy-image-placeholder absolute inset-0 animate-pulse bg-gray-200 ${placeholderClassName}`}
          aria-hidden="true"
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="lazy-image-error absolute inset-0 flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 p-4">
          <div className="text-center text-gray-500 mb-3">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-xs font-medium">Image failed to load</div>
            <div className="text-xs text-gray-400 mt-1">Please try again</div>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label="Retry loading image"
          >
            Retry
          </button>
        </div>
      )}

      {/* Actual image - only render when in view or priority */}
      {(isInView || priority) && (
        <img
          ref={imgRef}
          src={src}
          srcSet={imgSrcSet}
          sizes={imgSizes}
          alt={alt}
          className={`lazy-image w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : lqipUrl ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
};