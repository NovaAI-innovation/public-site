import type { GalleryResponse, GalleryQueryParams } from '../types/gallery';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Gallery API client
 * Provides functions for fetching gallery images from the backend API
 */
export class GalleryApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch gallery images with pagination support
   * 
   * @param params - Query parameters (limit, cursor)
   * @returns Promise resolving to GalleryResponse with images and pagination metadata
   * @throws Error if API request fails or response is not ok
   */
  async fetchGalleryImages(params: GalleryQueryParams = {}): Promise<GalleryResponse> {
    try {
      const { limit = 20, cursor } = params;
      const url = new URL(`${this.baseUrl}/gallery-images`);

      // Add query parameters
      url.searchParams.set('limit', limit.toString());
      if (cursor !== undefined && cursor !== null) {
        url.searchParams.set('cursor', cursor.toString());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Extract error details from FastAPI response format
        let errorMessage = `Gallery API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.detail?.message) {
            errorMessage = errorData.detail.message;
          } else if (errorData.detail) {
            errorMessage = typeof errorData.detail === 'string' 
              ? errorData.detail 
              : JSON.stringify(errorData.detail);
          }
        } catch {
          // If error response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }

      const data: GalleryResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);

      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Gallery fetch failed: ${error.message}`);
      }

      throw new Error('Gallery fetch failed: Unknown error');
    }
  }
}

// Create singleton instance
export const galleryApiClient = new GalleryApiClient();

/**
 * Standalone function for fetching gallery images
 * Can be used directly with React Query
 * 
 * @param limit - Number of images to fetch (default: 20)
 * @param cursor - Cursor for pagination (display_order value)
 * @returns Promise resolving to GalleryResponse
 */
export async function fetchGalleryImages(limit = 20, cursor?: number): Promise<GalleryResponse> {
  return galleryApiClient.fetchGalleryImages({ limit, cursor });
}