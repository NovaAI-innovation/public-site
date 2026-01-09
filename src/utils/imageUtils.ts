/**
 * Image utilities for Cloudinary optimization and responsive images
 * Provides functions to generate optimized image URLs and responsive image attributes
 */

export interface ImageSize {
  width: number;
  breakpoint?: number; // CSS breakpoint for media queries
}

export interface ResponsiveImageOptions {
  baseUrl: string;
  sizes?: ImageSize[];
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'scale' | 'fill' | 'crop' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
}

/**
 * Generate Cloudinary transformation parameters
 */
export function buildCloudinaryTransform(options: {
  width?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'scale' | 'fill' | 'crop' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
}): string {
  const params: string[] = [];

  if (options.width) params.push(`w_${options.width}`);
  if (options.quality) params.push(`q_${options.quality}`);
  if (options.format) params.push(`f_${options.format}`);
  if (options.crop) params.push(`c_${options.crop}`);
  if (options.gravity) params.push(`g_${options.gravity}`);

  return params.join(',');
}

/**
 * Generate optimized Cloudinary URL with transformations
 */
export function generateOptimizedImageUrl(
  cloudinaryUrl: string,
  options: Omit<ResponsiveImageOptions, 'sizes'>
): string {
  // Extract base URL (remove any existing query parameters)
  const baseUrl = cloudinaryUrl.split('?')[0];

  // Build transformation parameters
  const transform = buildCloudinaryTransform({
    width: undefined, // Will be set per size in srcset
    quality: options.quality || 'auto',
    format: options.format || 'auto',
    crop: options.crop || 'scale',
    gravity: options.gravity || 'auto',
  });

  return `${baseUrl}?${transform}`;
}

/**
 * Generate srcset string for responsive images
 */
export function generateSrcset(
  baseUrl: string,
  sizes: ImageSize[]
): string {
  return sizes
    .map(size => {
      const url = `${baseUrl}?${buildCloudinaryTransform({
        width: size.width,
        quality: 'auto',
        format: 'auto',
        crop: 'scale',
      })}`;
      return `${url} ${size.width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 * Based on CSS grid breakpoints and columns
 */
export function generateSizesAttribute(): string {
  return [
    '(max-width: 767px) 100vw',    // Mobile: 1 column, full width
    '(max-width: 1023px) 50vw',    // Tablet: 2 columns, half width
    '(max-width: 1279px) 33vw',    // Desktop: 3 columns, third width
    '25vw'                         // Large desktop: 4 columns, quarter width
  ].join(', ');
}

/**
 * Get responsive image sizes based on breakpoints
 */
export function getResponsiveSizes(): ImageSize[] {
  return [
    { width: 320, breakpoint: 320 },   // Mobile
    { width: 480, breakpoint: 480 },   // Small mobile
    { width: 640, breakpoint: 640 },   // Large mobile
    { width: 768, breakpoint: 768 },   // Tablet
    { width: 1024, breakpoint: 1024 }, // Desktop
    { width: 1280, breakpoint: 1280 }, // Large desktop
    { width: 1536, breakpoint: 1536 }, // Extra large
  ];
}

/**
 * Generate complete responsive image props for img element
 */
export function generateResponsiveImageProps(cloudinaryUrl: string) {
  const optimizedUrl = generateOptimizedImageUrl(cloudinaryUrl, {
    quality: 'auto',
    format: 'auto',
    crop: 'scale',
  });

  const sizes = getResponsiveSizes();
  const srcset = generateSrcset(optimizedUrl, sizes);
  const sizesAttr = generateSizesAttribute();

  // Default src (medium size for browsers without srcset support)
  const defaultSrc = `${optimizedUrl}&${buildCloudinaryTransform({
    width: 640,
    quality: 'auto',
    format: 'auto',
    crop: 'scale',
  })}`;

  return {
    src: defaultSrc,
    srcSet: srcset,
    sizes: sizesAttr,
  };
}

/**
 * Generate LQIP (Low Quality Image Placeholder) URL
 * Creates a heavily blurred, ultra-low quality version for instant loading
 */
export function generateLQIPUrl(cloudinaryUrl: string): string {
  // Extract base URL (remove any existing query parameters)
  const baseUrl = cloudinaryUrl.split('?')[0];

  // Apply extreme blur and lowest quality transformations
  const lqipTransform = buildCloudinaryTransform({
    width: 50, // Very small width
    quality: 1, // Lowest quality (1%)
    format: 'auto',
    crop: 'scale',
  });

  // Add blur effect
  const blurTransform = 'e_blur:1000'; // Maximum blur

  return `${baseUrl}?${lqipTransform},${blurTransform}`;
}

/**
 * Generate complete image props with LQIP support
 */
export function generateImageWithLQIPProps(cloudinaryUrl: string) {
  const responsiveProps = generateResponsiveImageProps(cloudinaryUrl);
  const lqipUrl = generateLQIPUrl(cloudinaryUrl);

  return {
    ...responsiveProps,
    lqipUrl,
  };
}

/**
 * Check if WebP is supported (for fallback detection)
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}