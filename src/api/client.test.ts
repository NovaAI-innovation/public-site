import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchGalleryImages, galleryApiClient } from './client';
import type { GalleryResponse } from '../types/gallery';

// Mock fetch globally
global.fetch = vi.fn();

describe('GalleryApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchGalleryImages', () => {
    it('should fetch gallery images successfully', async () => {
      const mockResponse: GalleryResponse = {
        images: [
          {
            id: 1,
            cloudinary_url: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg',
            caption: 'Test image',
            display_order: 1,
          },
        ],
        pagination: {
          next_cursor: 2,
          has_more: true,
          total_count: 10,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchGalleryImages(20);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/gallery-images'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should include limit parameter in request', async () => {
      const mockResponse: GalleryResponse = {
        images: [],
        pagination: {
          has_more: false,
          total_count: 0,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchGalleryImages(12);

      const fetchCall = (global.fetch as any).mock.calls[0][0];
      expect(fetchCall).toContain('limit=12');
    });

    it('should include cursor parameter when provided', async () => {
      const mockResponse: GalleryResponse = {
        images: [],
        pagination: {
          has_more: false,
          total_count: 0,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchGalleryImages(20, 5);

      const fetchCall = (global.fetch as any).mock.calls[0][0];
      expect(fetchCall).toContain('cursor=5');
    });

    it('should handle API errors with status codes', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ detail: 'Server error' }),
      });

      await expect(fetchGalleryImages()).rejects.toThrow('Gallery fetch failed');
    });

    it('should handle network failures', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchGalleryImages()).rejects.toThrow('Gallery fetch failed: Network error');
    });

    it('should extract error message from FastAPI response format', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          detail: {
            message: 'Invalid limit parameter',
          },
        }),
      });

      await expect(fetchGalleryImages()).rejects.toThrow('Invalid limit parameter');
    });

    it('should use default limit of 20 when not provided', async () => {
      const mockResponse: GalleryResponse = {
        images: [],
        pagination: {
          has_more: false,
          total_count: 0,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchGalleryImages();

      const fetchCall = (global.fetch as any).mock.calls[0][0];
      expect(fetchCall).toContain('limit=20');
    });
  });

  describe('galleryApiClient', () => {
    it('should be a singleton instance', () => {
      const client1 = galleryApiClient;
      const client2 = galleryApiClient;
      expect(client1).toBe(client2);
    });

    it('should use custom base URL when provided', async () => {
      const customClient = new (await import('./client')).GalleryApiClient('https://custom-api.com/api');
      const mockResponse: GalleryResponse = {
        images: [],
        pagination: {
          has_more: false,
          total_count: 0,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await customClient.fetchGalleryImages();

      const fetchCall = (global.fetch as any).mock.calls[0][0];
      expect(fetchCall).toContain('https://custom-api.com/api');
    });
  });
});
