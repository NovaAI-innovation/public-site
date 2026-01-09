import React, { useState, useCallback } from 'react';
import { generateImageWithLQIPProps } from '../../../utils/imageUtils';
import { ImageError } from '../ImageError/ImageError';
import styles from './ResponsiveImageWithLQIP.module.css';

interface ResponsiveImageWithLQIPProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ResponsiveImageWithLQIP component - responsive images with LQIP blur-up effect
 * Shows blurred low-quality placeholder immediately, then fades to full image
 * Includes error handling with retry functionality
 */
export function ResponsiveImageWithLQIP({
  src,
  alt,
  className,
  loading = 'lazy',
  onLoad,
  onError,
}: ResponsiveImageWithLQIPProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageKey, setImageKey] = useState(0); // Force re-render on retry
  const imageProps = generateImageWithLQIPProps(src);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    if (retryCount < 3) {
      // Retry loading the image
      setRetryCount(prev => prev + 1);
      setImageKey(prev => prev + 1); // Force image reload
      setIsLoaded(false);
    } else {
      // Max retries reached, show error
      setHasError(true);
      setIsLoaded(true);
      onError?.();
    }
  }, [retryCount, onError]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setHasError(false);
    setIsLoaded(false);
    setImageKey(prev => prev + 1); // Force image reload
  }, []);

  // Show error state if image failed after max retries
  if (hasError) {
    return (
      <div
        className={`${styles.imageContainer} ${className || ''}`}
        data-testid="image-with-lqip"
      >
        <ImageError
          onRetry={handleRetry}
          retryCount={retryCount}
          maxRetries={3}
          message="Unable to load image"
        />
      </div>
    );
  }

  return (
    <div
      className={`${styles.imageContainer} ${className || ''}`}
      data-testid="image-with-lqip"
    >
      {/* LQIP Background */}
      <img
        src={imageProps.lqipUrl}
        alt=""
        className={`${styles.imageLqip} ${isLoaded ? styles.fadeOut : ''}`}
        aria-hidden="true"
      />

      {/* Full Resolution Image */}
      <img
        key={imageKey}
        src={imageProps.src}
        srcSet={imageProps.srcSet}
        sizes={imageProps.sizes}
        alt={alt}
        className={`${styles.imageFull} ${isLoaded ? styles.loaded : ''}`}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        decoding="async"
      />
    </div>
  );
}