import React, { useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GalleryGrid } from '../../components/features/gallery/GalleryGrid/GalleryGrid';
import { GalleryIndicators } from '../../components/features/gallery/GalleryIndicators/GalleryIndicators';
import { Lightbox } from '../../components/features/lightbox/Lightbox/Lightbox';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner/LoadingSpinner';
import { GalleryImageSEO } from '../../components/SEO/SEO';
import { useGalleryImagesInfinite, flattenGalleryImages } from '../../api/hooks/useGalleryImagesInfinite';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useLightbox } from '../../hooks/useLightbox';
import styles from './GalleryContainer.module.css';
import type { GalleryImage } from '../../types/gallery';

interface GalleryContainerProps {
  limit?: number;
  onImageClick?: (image: GalleryImage) => void;
  initialImageId?: number;
}

/**
 * GalleryContainer component - data fetching container for gallery with infinite scroll
 * Uses useGalleryImagesInfinite hook and renders GalleryGrid with infinite loading
 * Supports deep linking via URL parameter (FR44)
 */
export function GalleryContainer({ limit = 20, onImageClick, initialImageId }: GalleryContainerProps) {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const params = useParams<{ imageId?: string }>();
  
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGalleryImagesInfinite(limit);

  const images = flattenGalleryImages(data);

  // Handle lightbox close - navigate back to gallery without imageId (FR44)
  const handleLightboxClose = () => {
    if (params.imageId) {
      navigate('/gallery', { replace: true });
    }
  };

  // Set up lightbox (FR22)
  const lightbox = useLightbox({
    images,
    initialIndex: 0,
    onClose: handleLightboxClose,
  });

  // Handle image click to open lightbox (FR22)
  // Store trigger element for focus restoration (FR25)
  // Update URL to include imageId for deep linking (FR44)
  const handleImageClick = (image: GalleryImage, triggerElement?: HTMLElement) => {
    lightbox.open(image, triggerElement);
    // Update URL to include imageId for deep linking (FR44)
    navigate(`/gallery/${image.id}`, { replace: false });
    // Also call the passed callback if provided
    onImageClick?.(image);
  };

  // Handle initial image ID from URL (deep linking) (FR44)
  useEffect(() => {
    if (!initialImageId && !params.imageId) return;
    if (isLoading || images.length === 0) return;
    
    const targetImageId = initialImageId || (params.imageId ? parseInt(params.imageId, 10) : undefined);
    if (!targetImageId || isNaN(targetImageId)) return;

    // Find the image in the loaded images
    const imageIndex = images.findIndex(img => img.id === targetImageId);
    
    if (imageIndex !== -1) {
      // Image found, open lightbox
      lightbox.open(images[imageIndex], null);
      } else {
        // Image not found in current loaded images
        // Try to load more pages if available
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        } else {
          // Image not found and no more pages - navigate to 404 (Task 3: Handle image not found)
          console.warn(`Image with ID ${targetImageId} not found`);
          navigate('/404', { replace: true });
        }
      }
  }, [initialImageId, params.imageId, isLoading, images, hasNextPage, isFetchingNextPage, fetchNextPage, navigate, lightbox]);

  // Update URL when lightbox navigation changes (deep linking) (FR44)
  useEffect(() => {
    if (lightbox.isOpen && lightbox.currentImage) {
      // Only update URL if it's different from current
      const currentImageId = params.imageId ? parseInt(params.imageId, 10) : undefined;
      if (currentImageId !== lightbox.currentImage.id) {
        navigate(`/gallery/${lightbox.currentImage.id}`, { replace: true });
      }
    }
    // Don't navigate away when closing - let the close handler do it
  }, [lightbox.isOpen, lightbox.currentImage?.id, params.imageId, navigate]);

  // Set up infinite scroll
  const sentinelRef = useInfiniteScroll(
    () => fetchNextPage(),
    !!hasNextPage,
    isFetchingNextPage
  );

  // Handle navigation to specific image
  const handleNavigateTo = (index: number) => {
    if (!gridContainerRef.current) return;

    const items = gridContainerRef.current.querySelectorAll('[role="button"][tabindex="0"]');
    const targetItem = items[index] as HTMLElement;
    if (targetItem) {
      targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetItem.focus();
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size="large" message="Loading gallery..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.error}>
        <h3>Failed to load gallery</h3>
        <p>{error?.message || 'An error occurred while loading the gallery.'}</p>
        <button
          onClick={() => refetch()}
          className={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.galleryContainer}>
      {/* Open Graph metadata for gallery images (FR45) */}
      {lightbox.isOpen && lightbox.currentImage && params.imageId && (
        <GalleryImageSEO image={lightbox.currentImage} />
      )}

      {/* Gallery indicators (dots for < 10, counter for 10+) */}
      {images.length > 0 && (
        <GalleryIndicators
          images={images}
          onNavigateTo={handleNavigateTo}
          containerRef={gridContainerRef}
        />
      )}

      <div ref={gridContainerRef}>
        <GalleryGrid
          images={images}
          onImageClick={handleImageClick}
        />
      </div>

      {/* Lightbox modal (FR22) with navigation controls (FR23) */}
      <Lightbox
        image={lightbox.currentImage}
        isOpen={lightbox.isOpen}
        onClose={() => {
          lightbox.close();
          // Navigate back to gallery without imageId when closing (FR44)
          if (params.imageId) {
            navigate('/gallery', { replace: true });
          }
        }}
        onPrevious={() => {
          lightbox.goToPrevious();
          // URL will be updated by the effect watching lightbox.currentImage
        }}
        onNext={() => {
          lightbox.goToNext();
          // URL will be updated by the effect watching lightbox.currentImage
        }}
        hasPrevious={lightbox.hasPrevious}
        hasNext={lightbox.hasNext}
        wrapAround={true}
      />

      {/* Infinite scroll sentinel */}
      {hasNextPage && (
        <div ref={sentinelRef} className={styles.sentinel}>
          {isFetchingNextPage && (
            <LoadingSpinner message="Loading more images..." />
          )}
        </div>
      )}

      {/* End of gallery indicator */}
      {!hasNextPage && images.length > 0 && (
        <div className={styles.endMessage}>
          <p>You've reached the end of the gallery</p>
        </div>
      )}
    </div>
  );
}
