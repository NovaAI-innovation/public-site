import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { GalleryItem } from '../GalleryItem/GalleryItem';
import { VirtualizedGalleryGrid } from '../VirtualizedGalleryGrid/VirtualizedGalleryGrid';
import { useSwipe } from '../../../../hooks/useSwipe';
import styles from './GalleryGrid.module.css';
import type { GalleryImage } from '../../../types/gallery';

interface GalleryGridProps {
  images: GalleryImage[];
  onImageClick?: (image: GalleryImage) => void;
}

// Threshold for using virtual scrolling (FR16: 100+ images)
const VIRTUAL_SCROLL_THRESHOLD = 100;

/**
 * GalleryGrid component - displays gallery images in a responsive grid layout
 * Responsive: 1 column mobile, 2 tablet, 3-4 desktop
 * Implements lazy loading with priority for initial viewport images
 * Supports keyboard navigation with arrow keys and touch swipe gestures
 * Uses virtual scrolling for galleries with 100+ images (FR16)
 */
export function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  // Use virtual scrolling for large galleries (100+ images)
  if (images.length >= VIRTUAL_SCROLL_THRESHOLD) {
    return <VirtualizedGalleryGrid images={images} onImageClick={onImageClick} />;
  }
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Determine which images are in the initial viewport (above fold)
  const { priorityImages, lazyImages } = useMemo(() => {
    if (!images.length) return { priorityImages: [], lazyImages: [] };

    // Estimate how many images fit in initial viewport
    // This is a simple heuristic - could be improved with actual viewport detection
    const viewportHeight = window?.innerHeight || 800;
    const imageHeight = 300; // Approximate image height
    const imagesPerRow = (window?.innerWidth || 1024) > 1024 ? 3 : (window?.innerWidth || 768) > 768 ? 2 : 1;
    const rowsInViewport = Math.ceil(viewportHeight / imageHeight);
    const priorityCount = rowsInViewport * imagesPerRow;

    return {
      priorityImages: images.slice(0, priorityCount),
      lazyImages: images.slice(priorityCount),
    };
  }, [images]);

  // Get all images in order
  const allImages = useMemo(() => [...priorityImages, ...lazyImages], [priorityImages, lazyImages]);

  // Navigate to next/previous image helper
  const navigateToImage = useCallback((direction: 'next' | 'prev') => {
    if (!gridRef.current) return;

    const allItems = Array.from(
      gridRef.current.querySelectorAll('[role="button"][tabindex="0"]') || []
    ) as HTMLElement[];

    if (allItems.length === 0) return;

    // Find currently focused item, or use first item
    const currentItem = document.activeElement as HTMLElement;
    const currentIndex = currentItem && gridRef.current.contains(currentItem)
      ? allItems.indexOf(currentItem)
      : -1;

    let nextIndex: number;
    if (currentIndex === -1) {
      // No item focused, focus first item
      nextIndex = 0;
    } else if (direction === 'next') {
      nextIndex = Math.min(currentIndex + 1, allItems.length - 1);
    } else {
      nextIndex = Math.max(currentIndex - 1, 0);
    }

    if (allItems[nextIndex]) {
      allItems[nextIndex].focus();
      // Scroll into view if needed
      allItems[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  // Swipe gesture handlers for mobile
  const swipeRef = useSwipe({
    onSwipeLeft: () => navigateToImage('next'),
    onSwipeRight: () => navigateToImage('prev'),
    threshold: 50, // 50px minimum swipe distance
    velocityThreshold: 0.3, // 0.3 px/ms minimum velocity
    preventDefault: false, // Allow native scrolling
  });

  // Sync swipe ref with grid ref
  useEffect(() => {
    if (gridRef.current && swipeRef.current !== gridRef.current) {
      swipeRef.current = gridRef.current;
    }
  }, [swipeRef]);

  // Handle arrow key navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle arrow keys when focus is within the gallery grid
    if (!gridRef.current?.contains(document.activeElement)) {
      return;
    }

    const focusedElement = document.activeElement as HTMLElement;
    if (!focusedElement) return;

    // Check if focused element is a gallery item (has role="button" and tabIndex)
    const currentItem = focusedElement.closest('[role="button"][tabindex="0"]') as HTMLElement;
    if (!currentItem || !gridRef.current?.contains(currentItem)) return;

    // Find current image index
    const allItems = Array.from(
      gridRef.current?.querySelectorAll('[role="button"][tabindex="0"]') || []
    ) as HTMLElement[];
    const currentIndex = allItems.indexOf(currentItem);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = Math.min(currentIndex + 1, allItems.length - 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = Math.max(currentIndex - 1, 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate down (next row) - estimate based on grid columns
      const imagesPerRow = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
      nextIndex = Math.min(currentIndex + imagesPerRow, allItems.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate up (previous row)
      const imagesPerRow = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
      nextIndex = Math.max(currentIndex - imagesPerRow, 0);
    }

    if (nextIndex !== currentIndex && allItems[nextIndex]) {
      allItems[nextIndex].focus();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!images.length) {
    return (
      <div className={styles.emptyState} data-testid="gallery-grid">
        <p>No images available</p>
      </div>
    );
  }

  return (
    <div
      ref={(node) => {
        gridRef.current = node;
        if (swipeRef.current !== undefined) {
          swipeRef.current = node;
        }
      }}
      className={styles.galleryGrid}
      data-testid="gallery-grid"
      role="grid"
      aria-label="Gallery images"
    >
      {/* Priority images (initial viewport) - load eagerly */}
      {priorityImages.map((image) => (
        <GalleryItem
          key={image.id}
          image={image}
          onClick={onImageClick}
          priority={true}
        />
      ))}

      {/* Lazy loaded images - load when near viewport */}
      {lazyImages.map((image) => (
        <GalleryItem
          key={image.id}
          image={image}
          onClick={onImageClick}
          priority={false}
        />
      ))}
    </div>
  );
}
