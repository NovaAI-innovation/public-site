import React from 'react';
import { useFavorites } from '../../../../contexts/FavoritesContext';
import styles from './FavoriteButton.module.css';
import type { GalleryImage } from '../../../../types/gallery';

interface FavoriteButtonProps {
  image: GalleryImage;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * FavoriteButton component - toggles favorite status for gallery images
 * Shows filled heart when favorited, outlined when not (FR19)
 */
export function FavoriteButton({ 
  image, 
  className, 
  size = 'medium' 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(image.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click (lightbox)
    toggleFavorite(image);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(image);
    }
  };

  return (
    <button
      className={`${styles.favoriteButton} ${styles[size]} ${favorited ? styles.favorited : ''} ${className || ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={favorited ? `Remove ${image.caption || 'image'} from favorites` : `Add ${image.caption || 'image'} to favorites`}
      aria-pressed={favorited}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="sr-only">
        {favorited ? 'Favorited' : 'Not favorited'}
      </span>
    </button>
  );
}