import type { GalleryImage } from '../types/gallery';

/**
 * Generates meaningful alt text for gallery images
 * Ensures all images have descriptive alt text for accessibility (FR10, NFR-A14)
 * 
 * @param image - Gallery image object
 * @param options - Options for alt text generation
 * @returns Meaningful alt text string
 */
export function generateAltText(
  image: GalleryImage,
  options: {
    fallback?: string;
    includeImageNumber?: boolean;
    index?: number;
  } = {}
): string {
  const {
    fallback = 'Gallery image',
    includeImageNumber = false,
    index,
  } = options;

  // Use caption if available (most descriptive)
  if (image.caption && image.caption.trim()) {
    let altText = image.caption.trim();
    
    // Optionally add image number for context
    if (includeImageNumber && index !== undefined) {
      altText = `Image ${index + 1}: ${altText}`;
    }
    
    return altText;
  }

  // Generate descriptive fallback if caption is missing
  if (index !== undefined) {
    return `${fallback} ${index + 1}`;
  }

  // Final fallback (should rarely be used)
  return fallback;
}

/**
 * Determines if an image should be marked as decorative (empty alt)
 * Decorative images are purely visual and don't convey meaningful information
 * 
 * @param image - Gallery image object
 * @returns true if image should be decorative (empty alt)
 */
export function isDecorativeImage(image: GalleryImage): boolean {
  // Images without captions are not decorative in a gallery context
  // They still convey information (the visual content)
  // Decorative images would need explicit flagging in the API
  return false;
}

/**
 * Gets alt text for a gallery image, handling decorative images
 * 
 * @param image - Gallery image object
 * @param options - Options for alt text generation
 * @returns Alt text string (empty string for decorative images)
 */
export function getImageAltText(
  image: GalleryImage,
  options: {
    fallback?: string;
    includeImageNumber?: boolean;
    index?: number;
  } = {}
): string {
  // If image is decorative, return empty string
  if (isDecorativeImage(image)) {
    return '';
  }

  // Generate meaningful alt text
  return generateAltText(image, options);
}