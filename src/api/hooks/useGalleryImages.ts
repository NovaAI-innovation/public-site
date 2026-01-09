import { useQuery } from '@tanstack/react-query';
import { fetchGalleryImages } from '../client';
import type { UseGalleryOptions } from '../../types/gallery';

/**
 * React Query hook for fetching gallery images
 * 
 * Uses useQuery (not useInfiniteQuery) for single-page data fetching.
 * For infinite scroll, use useGallery hook from hooks/useGallery.ts
 * 
 * @param options - Query options (limit, cursor, enabled)
 * @returns React Query result with gallery images data
 */
export function useGalleryImages(options: UseGalleryOptions = {}) {
  const { limit = 20, cursor, enabled = true } = options;

  return useQuery({
    queryKey: ['gallery-images', limit, cursor],
    queryFn: () => fetchGalleryImages(limit, cursor),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    enabled,
  });
}
