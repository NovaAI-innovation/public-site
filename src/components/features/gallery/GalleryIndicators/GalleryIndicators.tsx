import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './GalleryIndicators.module.css';
import type { GalleryImage } from '../../../types/gallery';

interface GalleryIndicatorsProps {
  images: GalleryImage[];
  onNavigateTo?: (index: number) => void;
  containerRef?: React.RefObject<HTMLElement>;
}

// Threshold for showing dots vs counter (FR13)
const DOTS_THRESHOLD = 10;

/**
 * GalleryIndicators component - visual indicators for gallery navigation
 * Shows dots for < 10 images, "X of Y" counter for 10+ images (FR13)
 * Clickable dots to jump to specific images (FR14)
 * Keyboard accessible with ARIA labels
 */
export function GalleryIndicators({ 
  images, 
  onNavigateTo, 
  containerRef 
}: GalleryIndicatorsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const indicatorRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Track which image is currently in viewport using Intersection Observer
  useEffect(() => {
    if (!containerRef?.current) return;

    const container = containerRef.current;
    const items = container.querySelectorAll('[role="button"][tabindex="0"]');
    
    if (items.length === 0) return;

    const observers: IntersectionObserver[] = [];

    items.forEach((item, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setActiveIndex(index);
          }
        },
        {
          root: null,
          threshold: [0, 0.5, 1],
          rootMargin: '-20% 0px -20% 0px', // Center of viewport
        }
      );

      observer.observe(item);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [images.length, containerRef]);

  const handleDotClick = useCallback((index: number) => {
    if (onNavigateTo) {
      onNavigateTo(index);
    } else if (containerRef?.current) {
      // Default behavior: scroll to image
      const items = containerRef.current.querySelectorAll('[role="button"][tabindex="0"]');
      const targetItem = items[index] as HTMLElement;
      if (targetItem) {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetItem.focus();
      }
    }
    setActiveIndex(index);
  }, [onNavigateTo, containerRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDotClick(index);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      handleDotClick(index - 1);
      indicatorRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < images.length - 1) {
      e.preventDefault();
      handleDotClick(index + 1);
      indicatorRefs.current[index + 1]?.focus();
    }
  }, [handleDotClick, images.length]);

  if (images.length === 0) {
    return null;
  }

  // Show dots for < 10 images, counter for 10+ images (FR13)
  if (images.length < DOTS_THRESHOLD) {
    return (
      <nav 
        className={styles.indicators}
        role="tablist"
        aria-label="Gallery navigation indicators"
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            ref={(el) => {
              indicatorRefs.current[index] = el;
            }}
            className={`${styles.dot} ${index === activeIndex ? styles.active : ''}`}
            onClick={() => handleDotClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Navigate to image ${index + 1} of ${images.length}`}
            tabIndex={index === activeIndex ? 0 : -1}
          >
            <span className="sr-only">Image {index + 1}</span>
          </button>
        ))}
      </nav>
    );
  }

  // Show "X of Y" counter for 10+ images (FR13)
  return (
    <nav 
      className={styles.counter}
      role="status"
      aria-live="polite"
      aria-label={`Gallery position indicator: ${activeIndex + 1} of ${images.length}`}
    >
      <span className={styles.counterText}>
        {activeIndex + 1} of {images.length}
      </span>
      <span className="sr-only">
        Image {activeIndex + 1} of {images.length}
      </span>
    </nav>
  );
}