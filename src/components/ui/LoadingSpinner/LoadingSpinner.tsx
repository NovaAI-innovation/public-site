import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

/**
 * LoadingSpinner component - displays a spinning loading indicator
 */
export function LoadingSpinner({
  size = 'medium',
  message,
  className
}: LoadingSpinnerProps) {
  return (
    <div className={`${styles.loadingSpinner} ${styles[size]} ${className || ''}`}>
      <div className={styles.spinner}></div>
      {message && (
        <p className={styles.message}>{message}</p>
      )}
    </div>
  );
}
