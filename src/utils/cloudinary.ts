import type { CloudinaryTransformOptions, ResponsiveImageSrc } from '../types/gallery';

/**
 * Cloudinary image transformation utility
 * Generates optimized image URLs with responsive sizes and formats
 */

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

/**
 * Build Cloudinary transformation string from options
 */
function buildTransformationString(options: CloudinaryTransformOptions): string {
  const transforms: string[] = [];

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.quality) transforms.push(`q_${options.quality}`);
  if (options.format) transforms.push(`f_${options.format}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);
  if (options.effect) transforms.push(`e_${options.effect}`);

  return transforms.join(',');
}

/**
 * Generate Cloudinary image URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const transformation = buildTransformationString(options);
  const transformPart = transformation ? `/${transformation}` : '';

  return `${CLOUDINARY_BASE_URL}/${CLOUDINARY_CLOUD_NAME}/image/upload${transformPart}/${publicId}`;
}

/**
 * Generate responsive image sources for different screen sizes
 * Returns array of src objects with media queries
 */
export function getResponsiveImageSources(publicId: string): ResponsiveImageSrc[] {
  const sources: ResponsiveImageSrc[] = [];

  // Mobile (320px - 767px): 320px width
  sources.push({
    src: getCloudinaryUrl(publicId, { width: 320, quality: 'auto', format: 'auto' }),
    width: 320,
    media: '(max-width: 767px)',
  });

  // Tablet (768px - 1023px): 640px width
  sources.push({
    src: getCloudinaryUrl(publicId, { width: 640, quality: 'auto', format: 'auto' }),
    width: 640,
    media: '(min-width: 768px) and (max-width: 1023px)',
  });

  // Desktop (1024px - 1279px): 800px width
  sources.push({
    src: getCloudinaryUrl(publicId, { width: 800, quality: 'auto', format: 'auto' }),
    width: 800,
    media: '(min-width: 1024px) and (max-width: 1279px)',
  });

  // Large desktop (1280px+): 1200px width
  sources.push({
    src: getCloudinaryUrl(publicId, { width: 1200, quality: 'auto', format: 'auto' }),
    width: 1200,
    media: '(min-width: 1280px)',
  });

  return sources;
}

/**
 * Generate srcset string for responsive images
 */
export function getSrcSet(publicId: string): string {
  const sources = getResponsiveImageSources(publicId);
  return sources.map(source => `${source.src} ${source.width}w`).join(', ');
}

/**
 * Get sizes attribute for responsive images based on grid layout
 */
export function getSizesAttribute(): string {
  return `
    (max-width: 767px) 100vw,
    (min-width: 768px) and (max-width: 1023px) 50vw,
    (min-width: 1024px) and (max-width: 1279px) 33.333vw,
    25vw
  `.trim();
}

/**
 * Generate low quality image placeholder (LQIP) URL
 */
export function getLQIPUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 20,
    quality: 20,
    format: 'jpg',
    effect: 'blur:1000'
  });
}

/**
 * Check if WebP is supported by the browser
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

/**
 * Get optimal image format based on browser support
 */
export async function getOptimalFormat(): Promise<'webp' | 'jpg'> {
  const webpSupported = await supportsWebP();
  return webpSupported ? 'webp' : 'jpg';
}