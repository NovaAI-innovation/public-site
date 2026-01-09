import React, { useMemo } from 'react';
import { useLazyImage } from '../../../../hooks/useIntersectionObserver';
import { ImageSkeleton } from '../../../ui/ImageSkeleton/ImageSkeleton';
import { ResponsiveImageWithLQIP } from '../../../ui/ResponsiveImageWithLQIP/ResponsiveImageWithLQIP';
import { ImageHoverOverlay } from '../ImageHoverOverlay/ImageHoverOverlay';
import { FavoriteButton } from '../FavoriteButton/FavoriteButton';
import { getImageAltText } from '../../../../utils/altTextUtils';
import styles from './GalleryItem.module.css';
import type { GalleryImage } from '../../../types/gallery';

interface GalleryItemProps {
  image: GalleryImage;
  onClick?: (image: GalleryImage, triggerElement?: HTMLElement) => void;
  priority?: boolean; // For images in initial viewport
  index?: number; // Optional index for numbered alt text
}

/**
 * GalleryItem component - displays individual gallery images with lazy loading
 * Maintains aspect ratio and handles click events for lightbox
 * Includes meaningful alt text for accessibility (FR10, NFR-A14)
 */
export function GalleryItem({ image, onClick, priority = false, index }: GalleryItemProps) {
  const [imageRef, imageSrc, isLoading] = useLazyImage(image.cloudinary_url, {
    // Disable lazy loading for priority images (initial viewport)
    rootMargin: priority ? '0px' : '200px',
  });

  // Generate meaningful alt text for accessibility (FR10, NFR-A14)
  const altText = useMemo(() => {
    return getImageAltText(image, {
      fallback: 'Gallery image',
      includeImageNumber: false, // Don't include number by default to avoid redundancy
      index,
    });
  }, [image, index]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(image, e.currentTarget);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Enter or Space opens lightbox
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(image, e.currentTarget);
    }
  };

  return (
    <div
      className={styles.galleryItem}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View image: ${altText}`}
    >
      <div className={styles.imageContainer}>
        {isLoading && (
          <ImageSkeleton aspectRatio="4 / 3" />
        )}
        <div ref={imageRef}>
          <ResponsiveImageWithLQIP
            src={priority ? image.cloudinary_url : (imageSrc || '')}
            alt={altText}
            className={styles.image}
            loading={priority ? 'eager' : 'lazy'}
          />
        </div>
        {/* Hover overlay - desktop only (FR9) */}
        <ImageHoverOverlay />
        {/* Favorite button (FR19) */}
        <FavoriteButton image={image} size="medium" />
      </div>
      {image.caption && (
        <div className={styles.caption}>
          {image.caption}
        </div>
      )}
    </div>
  );
}
