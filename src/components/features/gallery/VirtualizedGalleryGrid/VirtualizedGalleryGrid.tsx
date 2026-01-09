import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { GalleryItem } from '../GalleryItem/GalleryItem';
import styles from './VirtualizedGalleryGrid.module.css';
import type { GalleryImage } from '../../../types/gallery';

interface VirtualizedGalleryGridProps {
  images: GalleryImage[];
  onImageClick?: (image: GalleryImage) => void;
}

// Buffer for rendering items outside viewport (in pixels)
const VIEWPORT_BUFFER = 1000; // Render items 1000px above/below viewport

/**
 * VirtualizedGalleryGrid component - virtual scrolling for large galleries (100+ images)
 * Uses Intersection Observer to only render visible items + buffer
 * Maintains 60fps scrolling (NFR-P17) and consistent performance (NFR-P12)
 */
export function VirtualizedGalleryGrid({ images, onImageClick }: VirtualizedGalleryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelTopRef = useRef<HTMLDivElement>(null);
  const sentinelBottomRef = useRef<HTMLDivElement>(null);
  
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  // Calculate initial visible range based on viewport
  useEffect(() => {
    // Estimate items per row based on viewport width
    const itemsPerRow = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
    const itemHeight = 300; // Approximate item height
    const rowsInViewport = Math.ceil((window.innerHeight + VIEWPORT_BUFFER * 2) / itemHeight);
    const visibleCount = rowsInViewport * itemsPerRow;
    
    setVisibleRange({
      start: 0,
      end: Math.min(images.length, visibleCount * 2), // 2x buffer
    });
  }, [images.length]);

  // Update visible range on scroll with throttling
  useEffect(() => {
    let rafId: number | null = null;
    
    const handleScroll = () => {
      if (rafId !== null) return; // Throttle with RAF for 60fps (NFR-P17)
      
      rafId = requestAnimationFrame(() => {
        // Estimate items per row
        const itemsPerRow = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
        const itemHeight = 300;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        const rowsAbove = Math.floor(scrollTop / itemHeight);
        
        const start = Math.max(0, (rowsAbove * itemsPerRow) - itemsPerRow); // Buffer row above
        const rowsInViewport = Math.ceil((viewportHeight + VIEWPORT_BUFFER * 2) / itemHeight);
        const visibleCount = rowsInViewport * itemsPerRow;
        const end = Math.min(images.length, start + visibleCount + itemsPerRow * 2); // Extra buffer
        
        setVisibleRange(prev => {
          // Only update if range changed significantly (avoid unnecessary re-renders)
          if (Math.abs(prev.start - start) > itemsPerRow || Math.abs(prev.end - end) > itemsPerRow) {
            return { start, end };
          }
          return prev;
        });
        
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [images.length]);

  // Observe sentinels for more accurate range detection using Intersection Observer
  useEffect(() => {
    const topSentinel = sentinelTopRef.current;
    const bottomSentinel = sentinelBottomRef.current;
    
    if (!topSentinel && !bottomSentinel) return;

    const observerOptions: IntersectionObserverInit = {
      rootMargin: `${VIEWPORT_BUFFER}px`,
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === topSentinel && entry.isIntersecting && visibleRange.start > 0) {
          setVisibleRange(prev => ({
            start: Math.max(0, prev.start - 20),
            end: prev.end,
          }));
        }
        if (entry.target === bottomSentinel && entry.isIntersecting && visibleRange.end < images.length) {
          setVisibleRange(prev => ({
            start: prev.start,
            end: Math.min(images.length, prev.end + 20),
          }));
        }
      });
    }, observerOptions);

    if (topSentinel) observer.observe(topSentinel);
    if (bottomSentinel) observer.observe(bottomSentinel);

    return () => {
      if (topSentinel) observer.unobserve(topSentinel);
      if (bottomSentinel) observer.unobserve(bottomSentinel);
    };
  }, [visibleRange, images.length]);

  // Get visible images
  const visibleImages = useMemo(() => {
    return images.slice(visibleRange.start, visibleRange.end);
  }, [images, visibleRange]);

  // Create spacer divs for items before/after visible range
  const topSpacerHeight = visibleRange.start * 300; // Approximate height
  const bottomSpacerHeight = (images.length - visibleRange.end) * 300;

  if (!images.length) {
    return (
      <div className={styles.emptyState} data-testid="virtualized-gallery-grid">
        <p>No images available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.virtualizedGrid}
      data-testid="virtualized-gallery-grid"
      style={{ willChange: 'transform' }} // Optimize for 60fps (NFR-P17)
    >
      {/* Top spacer with sentinel */}
      {visibleRange.start > 0 && (
        <div 
          ref={sentinelTopRef} 
          style={{ height: topSpacerHeight, minHeight: 1 }} 
          aria-hidden="true"
        />
      )}
      
      {/* Visible images */}
      <div className={styles.gridContent}>
        {visibleImages.map((image, index) => {
          const actualIndex = visibleRange.start + index;
          const isPriority = actualIndex < 10; // First 10 images are priority
          
          return (
            <GalleryItem
              key={image.id}
              image={image}
              onClick={onImageClick}
              priority={isPriority}
            />
          );
        })}
      </div>

      {/* Bottom spacer with sentinel */}
      {visibleRange.end < images.length && (
        <div 
          ref={sentinelBottomRef} 
          style={{ height: bottomSpacerHeight, minHeight: 1 }} 
          aria-hidden="true"
        />
      )}
    </div>
  );
}