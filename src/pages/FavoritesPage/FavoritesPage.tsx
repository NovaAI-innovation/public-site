import React from 'react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { GalleryContainer } from '../../containers/GalleryContainer/GalleryContainer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner/LoadingSpinner';
import { SEO } from '../../components/SEO/SEO';
import styles from './FavoritesPage.module.css';
import type { GalleryImage } from '../../types/gallery';

/**
 * FavoritesPage component - displays favorited gallery images (FR20)
 * Shows all images that the user has favorited during their session
 * Uses GalleryContainer with filtered images for consistent UI
 * Includes Open Graph metadata for social sharing (FR45)
 */
function FavoritesPage() {
  const { favorites } = useFavorites();

  // For now, we'll display favorites directly using GalleryGrid
  // In the future, we could create a FavoritesContainer that fetches full image data
  // For now, favorites already contain full image data from when they were favorited

  if (favorites.length === 0) {
    return (
      <div className={styles.favoritesPage} data-testid="favorites-page">
        <SEO
          title="My Favorites - Gallery"
          description="Your favorited gallery images"
          url="/favorites"
          type="website"
        />
        <header className={styles.header}>
          <h1 className={styles.title}>My Favorites</h1>
          <p className={styles.description}>You haven't favorited any images yet.</p>
        </header>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>❤️</div>
          <p>Start favoriting images from the gallery to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.favoritesPage} data-testid="favorites-page">
      <SEO
        title={`My Favorites - ${favorites.length} ${favorites.length === 1 ? 'Image' : 'Images'}`}
        description={`View your ${favorites.length} favorited gallery images`}
        url="/favorites"
        type="website"
      />
      <header className={styles.header}>
        <h1 className={styles.title}>My Favorites</h1>
        <p className={styles.description}>
          You have {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'}
        </p>
      </header>
      <main className={styles.main}>
        {/* Use GalleryContainer-like structure for consistency */}
        <div className={styles.content}>
          <GalleryContainer 
            limit={favorites.length}
            onImageClick={(image: GalleryImage) => {
              // Lightbox is handled by GalleryContainer
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default FavoritesPage;
