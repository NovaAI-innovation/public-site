// Gallery API types and interfaces
// These types match the backend API contract from backend12/app/schemas.py

/**
 * Gallery image response from backend API
 * Matches GalleryImagePublicResponse schema
 */
export interface GalleryImage {
  id: number;
  cloudinary_url: string;
  caption?: string | null;
  display_order: number;
}

/**
 * Pagination metadata from backend API
 * Matches PaginationMetadata schema
 */
export interface PaginationMetadata {
  next_cursor?: number | null;
  has_more: boolean;
  total_count: number;
}

/**
 * Paginated gallery response from backend API
 * Matches GalleryImagesPageResponse schema
 */
export interface GalleryResponse {
  images: GalleryImage[];
  pagination: PaginationMetadata;
}

/**
 * Query parameters for gallery API requests
 */
export interface GalleryQueryParams {
  limit?: number;
  cursor?: number;
}

/**
 * Options for useGalleryImages hook
 */
export interface UseGalleryOptions {
  limit?: number;
  cursor?: number;
  enabled?: boolean;
}

// Additional types for frontend transformations
export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  crop?: 'fill' | 'scale' | 'crop' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
  effect?: string;
}

export interface ResponsiveImageSrc {
  src: string;
  width: number;
  media?: string; // CSS media query
}