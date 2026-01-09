import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchGalleryImages } from '../client';
import type { GalleryQueryParams } from '../../types/gallery';

/**
 * React Query hook for infinite scrolling gallery images
 * Uses cursor-based pagination with accumulation
 */
export function useGalleryImagesInfinite(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: ['gallery-images', 'infinite', limit],
    queryFn: async ({ pageParam }: { pageParam?: number }) => {
      return fetchGalleryImages(limit, pageParam);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.has_more ? lastPage.pagination.next_cursor : undefined;
    },
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

/**
 * Flatten all pages of gallery images into a single array
 */
export function flattenGalleryImages(data: ReturnType<typeof useGalleryImagesInfinite>['data']) {
  return data?.pages.flatMap(page => page.images) ?? [];
}