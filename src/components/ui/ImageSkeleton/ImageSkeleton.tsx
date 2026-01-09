import React from 'react';
import styles from './ImageSkeleton.module.css';

interface ImageSkeletonProps {
  aspectRatio?: string;
  className?: string;
}

/**
 * ImageSkeleton component - displays a loading skeleton for images
 * Matches the aspect ratio of gallery images (4:3 by default)
 */
export function ImageSkeleton({
  aspectRatio = '4 / 3',
  className
}: ImageSkeletonProps) {
  return (
    <div
      className={`${styles.imageSkeleton} ${className || ''}`}
      style={{ aspectRatio }}
      data-testid="image-skeleton"
    >
      <div className={styles.skeletonContent}>
        <div className={styles.shimmer}></div>
      </div>
    </div>
  );
}