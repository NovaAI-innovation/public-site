import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGalleryImagesInfinite, flattenGalleryImages } from './useGalleryImagesInfinite';
import { fetchGalleryImages } from '../client';

// Mock the API client
vi.mock('../client', () => ({
  fetchGalleryImages: vi.fn(),
}));

describe('useGalleryImagesInfinite', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('fetches gallery images with infinite query', async () => {
    const mockResponse = {
      images: [
        {
          id: 1,
          cloudinary_url: 'https://example.com/image1.jpg',
          caption: 'Image 1',
          display_order: 1,
        },
      ],
      pagination: {
        next_cursor: 2,
        has_more: true,
        total_count: 10,
      },
    };

    const mockFetch = vi.mocked(fetchGalleryImages);
    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGalleryImagesInfinite(20), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0]).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(20, undefined);
  });

  it('returns correct pagination info', async () => {
    const mockResponse = {
      images: [],
      pagination: {
        has_more: false,
        total_count: 5,
      },
    };

    const mockFetch = vi.mocked(fetchGalleryImages);
    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGalleryImagesInfinite(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(false);
  });

  it('uses correct query key and limit', async () => {
    const mockResponse = {
      images: [],
      pagination: { has_more: false, total_count: 0 },
    };

    const mockFetch = vi.mocked(fetchGalleryImages);
    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGalleryImagesInfinite(15), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify the hook was called with the correct limit
    expect(mockFetch).toHaveBeenCalledWith(15, undefined);
  });
});

describe('flattenGalleryImages', () => {
  it('flattens multiple pages of images', () => {
    const data = {
      pages: [
        {
          images: [
            { id: 1, cloudinary_url: 'url1', caption: 'Image 1', display_order: 1 },
            { id: 2, cloudinary_url: 'url2', caption: 'Image 2', display_order: 2 },
          ],
          pagination: { has_more: true, next_cursor: 3, total_count: 10 },
        },
        {
          images: [
            { id: 3, cloudinary_url: 'url3', caption: 'Image 3', display_order: 3 },
            { id: 4, cloudinary_url: 'url4', caption: 'Image 4', display_order: 4 },
          ],
          pagination: { has_more: false, total_count: 10 },
        },
      ],
      pageParams: [undefined, 3],
    };

    const flattened = flattenGalleryImages(data);

    expect(flattened).toHaveLength(4);
    expect(flattened[0].id).toBe(1);
    expect(flattened[1].id).toBe(2);
    expect(flattened[2].id).toBe(3);
    expect(flattened[3].id).toBe(4);
  });

  it('returns empty array when no data', () => {
    const flattened = flattenGalleryImages(undefined);

    expect(flattened).toEqual([]);
  });

  it('returns empty array when no pages', () => {
    const data = { pages: [], pageParams: [] };
    const flattened = flattenGalleryImages(data);

    expect(flattened).toEqual([]);
  });
});
