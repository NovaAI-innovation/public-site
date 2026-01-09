import React, { useState, useEffect, useCallback } from 'react';
import type { GalleryImage } from '../../types/gallery';
import { LazyImage } from '../ui/LazyImage';

interface GalleryGridProps {
  images: GalleryImage[];
  isLoading?: boolean;
  className?: string;
}

interface GalleryImageCardProps {
  image: GalleryImage;
  onClick?: () => void;
  onFocus?: () => void;
  priority?: boolean; // Whether this image should load eagerly
  isFocused?: boolean; // Whether this image is currently focused for keyboard navigation
}

/**
 * Individual gallery image card component
 */
const GalleryImageCard: React.FC<GalleryImageCardProps> = ({
  image,
  onClick,
  onFocus,
  priority = false,
  isFocused = false
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  // Minimum swipe distance (in px) to be considered a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    // Only handle horizontal swipes, ignore vertical swipes (scrolling)
    if (isVerticalSwipe) return;

    // Prevent default click behavior for swipes
    e.preventDefault();

    if (isLeftSwipe) {
      // TODO: Navigate to next image when implemented
      console.log('Swipe left - next image');
    }

    if (isRightSwipe) {
      // TODO: Navigate to previous image when implemented
      console.log('Swipe right - previous image');
    }
  };
  return (
    <div
      className={`gallery-image-card group cursor-pointer overflow-hidden rounded-lg bg-gray-100 transition-all duration-300 hover:shadow-lg ${
        isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      onClick={onClick}
      onFocus={onFocus}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="button"
      tabIndex={0}
      aria-label={`View image: ${image.altText || image.caption || 'Gallery image'}`}
    >
      <div className="aspect-square overflow-hidden relative">
        <LazyImage
          src={image.thumbnailUrl || image.cloudinaryUrl}
          cloudinaryPublicId={image.cloudinaryPublicId}
          alt={image.altText || image.caption || ''}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          priority={priority}
          useLQIP={true}
        />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-20" />

      {/* Caption overlay (if present) */}
      {image.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-white text-sm font-medium truncate">{image.caption}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Loading skeleton for gallery images
 */
const GalleryImageSkeleton: React.FC = () => (
  <div className="gallery-image-skeleton aspect-square animate-pulse overflow-hidden rounded-lg bg-gray-200">
    <div className="h-full w-full bg-gray-300" />
  </div>
);

/**
 * Gallery grid component with responsive layout
 * - 1 column on mobile (320-767px)
 * - 2 columns on tablet (768-1023px)
 * - 3-4 columns on desktop (1024px+)
 */
export const GalleryGrid: React.FC<GalleryGridProps> = ({
  images,
  isLoading = false,
  className = '',
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Calculate grid dimensions for keyboard navigation
  const getGridDimensions = useCallback(() => {
    const viewportWidth = window.innerWidth;
    let columns: number;

    if (viewportWidth < 768) columns = 1; // Mobile
    else if (viewportWidth < 1024) columns = 2; // Tablet
    else if (viewportWidth < 1280) columns = 3; // Desktop
    else columns = 4; // Large desktop

    const rows = Math.ceil(images.length / columns);
    return { columns, rows };
  }, [images.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!images.length || focusedIndex === null) return;

    const { columns } = getGridDimensions();
    let newIndex = focusedIndex;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        newIndex = Math.min(focusedIndex + 1, images.length - 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = Math.max(focusedIndex - 1, 0);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newIndex = Math.min(focusedIndex + columns, images.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = Math.max(focusedIndex - columns, 0);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = images.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        // TODO: Open lightbox when implemented
        console.log('Open lightbox for image:', images[focusedIndex]);
        break;
      default:
        return;
    }

    setFocusedIndex(newIndex);
  }, [images, focusedIndex, getGridDimensions]);

  // Add/remove keyboard event listeners
  useEffect(() => {
    if (focusedIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [focusedIndex, handleKeyDown]);

  // Handle image click to set focus
  const handleImageClick = useCallback((image: GalleryImage, index: number) => {
    setFocusedIndex(index);
    // TODO: Open lightbox when implemented
    console.log('Image clicked:', image);
  }, []);

  // Handle image focus
  const handleImageFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);
  return (
    <div
      className={`gallery-grid grid gap-4 ${className}`}
      style={{
        // CSS Grid responsive columns
        // Using style prop for dynamic grid-template-columns
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      }}
    >
      {/* Loading skeletons */}
      {isLoading &&
        Array.from({ length: 12 }).map((_, index) => (
          <GalleryImageSkeleton key={`skeleton-${index}`} />
        ))}

      {/* Gallery images */}
      {!isLoading &&
        images.map((image, index) => (
          <GalleryImageCard
            key={image.id}
            image={image}
            priority={index < 6} // Load first 6 images eagerly (roughly one viewport on desktop)
            isFocused={focusedIndex === index}
            onClick={() => handleImageClick(image, index)}
            onFocus={() => handleImageFocus(index)}
          />
        ))}

      {/* Empty state */}
      {!isLoading && images.length === 0 && (
        <div className="col-span-full flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-500">Check back later for new gallery content.</p>
          </div>
        </div>
      )}
    </div>
  );
};