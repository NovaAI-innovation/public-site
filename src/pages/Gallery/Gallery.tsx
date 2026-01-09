import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GalleryContainer } from '../../containers/GalleryContainer/GalleryContainer';
import { SEO } from '../../components/SEO/SEO';
import styles from './Gallery.module.css';

/**
 * GalleryPage component - displays the main image gallery
 * Uses GalleryContainer for data fetching and display (Epic 2)
 * Supports deep linking via /gallery/:imageId (FR44)
 * Includes Open Graph metadata for social sharing (FR45)
 */
function Gallery() {
  const { imageId } = useParams<{ imageId?: string }>();
  const navigate = useNavigate();

  // Validate imageId if provided (Task 3: Handle image not found)
  useEffect(() => {
    if (imageId) {
      const parsedId = parseInt(imageId, 10);
      // If imageId is not a valid number, navigate to 404
      if (isNaN(parsedId) || parsedId <= 0) {
        navigate('/404', { replace: true });
      }
    }
  }, [imageId, navigate]);

  return (
    <div className={styles.galleryPage} data-testid="gallery-page">
      <SEO
        title="Gallery - Explore Our Collection"
        description="Explore our collection of beautiful images"
        url="/gallery"
        type="website"
      />
      <main className={styles.main}>
        {/* Page header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Gallery</h1>
          <p className={styles.description}>
            Explore our collection of beautiful images
          </p>
        </div>

        {/* Gallery container with infinite scroll and lightbox (Epic 2, Epic 3) */}
        {/* Pass imageId from URL for deep linking (FR44) */}
        <div id="gallery-content" className={styles.content}>
          <GalleryContainer limit={20} initialImageId={imageId ? parseInt(imageId, 10) : undefined} />
        </div>
      </main>
    </div>
  );
}

export default Gallery;
