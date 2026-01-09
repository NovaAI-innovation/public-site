import React from 'react';
import styles from './LightboxControls.module.css';

interface LightboxControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  wrapAround?: boolean; // If true, always show controls (wrap around at edges)
}

/**
 * LightboxControls component - navigation controls for lightbox
 * Previous/next arrow buttons for navigating between images (FR23)
 * Supports wrap-around navigation at beginning/end of gallery
 */
export function LightboxControls({
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
  wrapAround = true, // Default to wrap-around navigation
}: LightboxControlsProps) {
  const showPrevious = wrapAround || hasPrevious;
  const showNext = wrapAround || hasNext;

  const handlePreviousClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent closing lightbox
    onPrevious();
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent closing lightbox
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent, direction: 'prev' | 'next') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (direction === 'prev') {
        onPrevious();
      } else {
        onNext();
      }
    }
  };

  return (
    <>
      {/* Previous button */}
      {showPrevious && (
        <button
          className={`${styles.control} ${styles.previous}`}
          onClick={handlePreviousClick}
          onKeyDown={(e) => handleKeyDown(e, 'prev')}
          aria-label="Previous image"
          title="Previous image"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {showNext && (
        <button
          className={`${styles.control} ${styles.next}`}
          onClick={handleNextClick}
          onKeyDown={(e) => handleKeyDown(e, 'next')}
          aria-label="Next image"
          title="Next image"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </>
  );
}