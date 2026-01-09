import React from 'react';
import styles from './ImageError.module.css';

interface ImageErrorProps {
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  message?: string;
  className?: string;
}

/**
 * ImageError component - displays user-friendly error message when images fail to load
 * Includes retry functionality with attempt limits
 */
export function ImageError({
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  message,
  className,
}: ImageErrorProps) {
  const canRetry = onRetry && retryCount < maxRetries;
  const defaultMessage = retryCount >= maxRetries
    ? 'Unable to load image'
    : 'Image failed to load';

  return (
    <div
      className={`${styles.imageError} ${className || ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.errorIcon}>⚠️</div>
      <p className={styles.errorMessage}>
        {message || defaultMessage}
      </p>
      {canRetry && (
        <button
          onClick={onRetry}
          className={styles.retryButton}
          aria-label="Retry loading image"
        >
          Try Again
        </button>
      )}
    </div>
  );
}