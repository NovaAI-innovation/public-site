import React, { useEffect, useRef, useState, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ResponsiveImageWithLQIP } from '../../../ui/ResponsiveImageWithLQIP/ResponsiveImageWithLQIP';
import { LoadingSpinner } from '../../../ui/LoadingSpinner/LoadingSpinner';
import { LightboxControls } from '../LightboxControls/LightboxControls';
import { LightboxCloseButton } from '../LightboxCloseButton/LightboxCloseButton';
import { FullscreenToggle } from '../FullscreenToggle/FullscreenToggle';
import { useFullscreen } from '../../../../hooks/useFullscreen';
import { useSwipe } from '../../../../hooks/useSwipe';
import { usePinchZoom } from '../../../../hooks/usePinchZoom';
import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import styles from './Lightbox.module.css';
import type { GalleryImage } from '../../../../types/gallery';

interface LightboxProps {
  image: GalleryImage | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  wrapAround?: boolean;
}

/**
 * Lightbox component - full-screen modal for viewing gallery images
 * Displays image in center with darkened background overlay (FR22)
 * Prevents page scrolling when open (FR29)
 * Includes navigation controls for previous/next images (FR23)
 */
export function Lightbox({ 
  image, 
  isOpen, 
  onClose,
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
  wrapAround = true,
}: LightboxProps) {
  // Fullscreen management (FR30)
  const { isFullscreen, toggleFullscreen, isSupported: isFullscreenSupported } = useFullscreen();

  // Swipe gestures for navigation (FR31)
  const swipeRef = useSwipe({
    onSwipeLeft: onNext || undefined,
    onSwipeRight: onPrevious || undefined,
    threshold: 50, // 50px minimum swipe distance
    velocityThreshold: 0.3, // 0.3 px/ms minimum velocity
    preventDefault: false, // Allow default touch behavior for pinch
  });

  // Pinch-to-zoom for tablets (FR31)
  const { elementRef: pinchRef, scale, reset: resetZoom } = usePinchZoom({
    minScale: 1,
    maxScale: 5,
    initialScale: 1,
  });

  // Reset zoom when image changes
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Accessibility: IDs for aria-describedby
  const captionId = useId();
  const liveRegionId = useId();
  
  // Loading state for screen reader announcements and UI (FR33)
  const [imageLoadingState, setImageLoadingState] = useState<'loading' | 'loaded' | 'error' | null>(null);

  // Focus trap and management (FR34, NFR-A3)
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxContainerRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useFocusTrap({
    enabled: isOpen,
    initialFocus: closeButtonRef, // Focus close button first (FR34)
    returnFocus: true,
  });
  
  // Connect focus trap ref to lightbox container
  useEffect(() => {
    if (lightboxContainerRef.current) {
      (focusTrapRef as any).current = lightboxContainerRef.current;
    }
  }, [focusTrapRef]);

  // Handle keyboard navigation (FR24, FR26)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key: exit fullscreen first, then close lightbox (FR26)
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        
        // If in fullscreen, exit fullscreen first
        if (isFullscreen) {
          toggleFullscreen();
          return;
        }
        
        // Otherwise, close lightbox
        onClose();
        return;
      }

      // Arrow keys for navigation (FR24)
      if (e.key === 'ArrowLeft' && onPrevious) {
        e.preventDefault();
        e.stopPropagation();
        onPrevious();
        return;
      }

      if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        e.stopPropagation();
        onNext();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose, onPrevious, onNext, isFullscreen, toggleFullscreen]);

  // Prevent body scroll when open (handled by useLightbox, but ensure it's working)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Reset zoom when image changes
  useEffect(() => {
    if (image && isOpen) {
      resetZoom();
    }
  }, [image, isOpen, resetZoom]);

  // Combine refs for swipe and pinch gestures - use lightboxContainerRef
  useEffect(() => {
    if (lightboxContainerRef.current) {
      (swipeRef as any).current = lightboxContainerRef.current;
      (pinchRef as any).current = lightboxContainerRef.current;
    }
  }, [swipeRef, pinchRef]);

  // Reset loading state when image changes
  useEffect(() => {
    if (image && isOpen) {
      setImageLoadingState('loading');
    } else {
      setImageLoadingState(null);
    }
  }, [image, isOpen]);

  // Handle image load events
  const handleImageLoad = useCallback(() => {
    setImageLoadingState('loaded');
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoadingState('error');
  }, []);

  if (!isOpen || !image) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Render using portal to ensure proper z-index and focus management
  return createPortal(
    <div
      ref={lightboxContainerRef}
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing image: ${image.caption || 'Gallery image'}`}
      aria-describedby={image.caption ? captionId : undefined}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        // Prevent default keyboard behavior when lightbox is focused
        // This ensures arrow keys work even if focus is on the container
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Escape') {
          e.stopPropagation();
        }
      }}
      tabIndex={-1}
      data-testid="lightbox"
    >
      {/* Screen reader announcements (FR33) */}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {imageLoadingState === 'loading' && 'Loading image...'}
        {imageLoadingState === 'loaded' && `Image loaded: ${image.caption || 'Gallery image'}`}
        {imageLoadingState === 'error' && 'Failed to load image'}
      </div>

      <div className={styles.overlay} aria-hidden="true" />
      
      {/* Close button (FR25) - First interactive element for focus (FR34) */}
      <LightboxCloseButton onClose={onClose} buttonRef={closeButtonRef} />
      
      {/* Fullscreen toggle (FR30) */}
      <FullscreenToggle
        isFullscreen={isFullscreen}
        onToggle={toggleFullscreen}
        isSupported={isFullscreenSupported}
      />
      
      <div className={styles.content}>
        {/* Navigation controls (FR23) */}
        {onPrevious && onNext && (
          <LightboxControls
            onPrevious={onPrevious}
            onNext={onNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            wrapAround={wrapAround}
          />
        )}

        <div 
          ref={imageContainerRef}
          className={styles.imageContainer}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: scale === 1 ? 'transform 0.3s ease' : 'none',
          }}
        >
          {/* Loading indicator overlay */}
          {imageLoadingState === 'loading' && (
            <div className={styles.loadingOverlay} aria-hidden="true">
              <LoadingSpinner size="large" message="Loading image..." />
            </div>
          )}

          <ResponsiveImageWithLQIP
            src={image.cloudinary_url}
            alt={image.caption || 'Gallery image'}
            className={styles.image}
            loading="eager"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
        {image.caption && (
          <div 
            id={captionId}
            className={styles.caption} 
            aria-label={`Image caption: ${image.caption}`}
          >
            {image.caption}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}