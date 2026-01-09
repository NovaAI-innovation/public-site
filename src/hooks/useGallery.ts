import { useInfiniteQuery } from '@tanstack/react-query';
import { galleryApiClient } from '../api/client';
import type { GalleryQueryParams, UseGalleryOptions } from '../types/gallery';

// Query keys for React Query
export const galleryQueryKeys = {
  all: ['gallery'] as const,
  images: (params?: GalleryQueryParams) => [...galleryQueryKeys.all, 'images', params] as const,
};

/**
 * React Query hook for fetching gallery images with infinite scroll support
 */
export function useGallery(options: UseGalleryOptions = {}) {
  const { limit = 20, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: galleryQueryKeys.images({ limit }),
    queryFn: async ({ pageParam }) => {
      return galleryApiClient.fetchGalleryImages({
        limit,
        cursor: pageParam as string | undefined,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNext ? lastPage.pagination.cursor : undefined;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });
}