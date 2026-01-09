import React from 'react';
import styles from './ImageHoverOverlay.module.css';

interface ImageHoverOverlayProps {
  className?: string;
}

/**
 * ImageHoverOverlay component - displays visual icons on hover
 * Desktop-only feature showing eye icon and click indicator
 * Smooth fade-in transition with prefers-reduced-motion support
 */
export function ImageHoverOverlay({ className }: ImageHoverOverlayProps) {
  return (
    <div className={`${styles.overlay} overlay ${className || ''}`}>
      <div className={styles.content}>
        <div className={`${styles.icon} icon`} aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className={styles.label}>View</span>
      </div>
    </div>
  );
}