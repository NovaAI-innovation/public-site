import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GalleryImage } from '../types/gallery';

interface FavoritesContextType {
  favorites: GalleryImage[];
  isFavorite: (imageId: number) => boolean;
  addFavorite: (image: GalleryImage) => void;
  removeFavorite: (imageId: number) => void;
  toggleFavorite: (image: GalleryImage) => void;
  clearFavorites: () => void;
  loadFavoritesFromUrl: (favoriteIds: number[]) => void;
  getFavoriteIds: () => number[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'gallery_favorites';
const URL_PARAM_KEY = 'favorites';

/**
 * FavoritesContext - manages favorites/bookmarking state
 * Stores favorites in localStorage for session persistence
 * Supports URL sharing with favorite IDs (FR21)
 */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<GalleryImage[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GalleryImage[];
        setFavorites(parsed);
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
    }
  }, []);

  // Load favorites from URL on mount (FR21)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const favoriteIdsParam = urlParams.get(URL_PARAM_KEY);
    
    if (favoriteIdsParam) {
      try {
        const favoriteIds = favoriteIdsParam
          .split(',')
          .map(id => parseInt(id, 10))
          .filter(id => !isNaN(id));
        
        if (favoriteIds.length > 0) {
          loadFavoritesFromUrl(favoriteIds);
        }
      } catch (error) {
        console.error('Failed to parse favorites from URL:', error);
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }, [favorites]);

  // Update URL when favorites change (FR21)
  useEffect(() => {
    const url = new URL(window.location.href);
    const favoriteIds = favorites.map(img => img.id);
    
    if (favoriteIds.length > 0) {
      url.searchParams.set(URL_PARAM_KEY, favoriteIds.join(','));
    } else {
      url.searchParams.delete(URL_PARAM_KEY);
    }
    
    // Update URL without reload (using history API)
    window.history.replaceState({}, '', url.toString());
  }, [favorites]);

  const isFavorite = useCallback((imageId: number): boolean => {
    return favorites.some(img => img.id === imageId);
  }, [favorites]);

  const addFavorite = useCallback((image: GalleryImage) => {
    setFavorites(prev => {
      if (prev.some(img => img.id === image.id)) {
        return prev; // Already favorited
      }
      return [...prev, image];
    });
  }, []);

  const removeFavorite = useCallback((imageId: number) => {
    setFavorites(prev => prev.filter(img => img.id !== imageId));
  }, []);

  const toggleFavorite = useCallback((image: GalleryImage) => {
    setFavorites(prev => {
      const isFav = prev.some(img => img.id === image.id);
      if (isFav) {
        return prev.filter(img => img.id !== image.id);
      }
      return [...prev, image];
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const loadFavoritesFromUrl = useCallback((favoriteIds: number[]) => {
    // Note: In a real app, you'd fetch the full image data from the API
    // For now, we'll just store the IDs and the user would need to navigate
    // to the gallery to see the images. In a full implementation, you'd
    // fetch the image data from the backend.
    setFavorites(prev => {
      const existingIds = new Set(prev.map(img => img.id));
      const newIds = favoriteIds.filter(id => !existingIds.has(id));
      
      // Create placeholder images for IDs we don't have yet
      // In production, you'd fetch these from the API
      const newImages: GalleryImage[] = newIds.map(id => ({
        id,
        cloudinary_url: '',
        caption: `Favorite image ${id}`,
        display_order: prev.length + 1,
      }));
      
      return [...prev, ...newImages];
    });
  }, []);

  const getFavoriteIds = useCallback((): number[] => {
    return favorites.map(img => img.id);
  }, [favorites]);

  const value: FavoritesContextType = {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    loadFavoritesFromUrl,
    getFavoriteIds,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

/**
 * Hook to access favorites context
 */
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}