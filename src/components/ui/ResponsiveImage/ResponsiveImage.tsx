import React from 'react';
import { generateResponsiveImageProps } from '../../../utils/imageUtils';
import styles from './ResponsiveImage.module.css';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ResponsiveImage component - optimized images with Cloudinary transformations
 * Automatically generates srcset, sizes, and format optimizations
 */
export function ResponsiveImage({
  src,
  alt,
  className,
  loading = 'lazy',
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const imageProps = generateResponsiveImageProps(src);

  return (
    <img
      src={imageProps.src}
      srcSet={imageProps.srcSet}
      sizes={imageProps.sizes}
      alt={alt}
      className={`${styles.responsiveImage} ${className || ''}`}
      loading={loading}
      onLoad={onLoad}
      onError={onError}
      decoding="async"
    />
  );
}