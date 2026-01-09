import { describe, it, expect } from 'vitest';
import { generateAltText, isDecorativeImage, getImageAltText } from './altTextUtils';
import type { GalleryImage } from '../types/gallery';

describe('altTextUtils', () => {
  const mockImage: GalleryImage = {
    id: 1,
    cloudinary_url: 'https://example.com/image.jpg',
    caption: 'A beautiful sunset over the ocean',
    display_order: 1,
  };

  describe('generateAltText', () => {
    it('uses caption if available', () => {
      const altText = generateAltText(mockImage);
      expect(altText).toBe('A beautiful sunset over the ocean');
    });

    it('returns fallback if caption is missing', () => {
      const imageWithoutCaption: GalleryImage = {
        ...mockImage,
        caption: undefined,
      };
      
      const altText = generateAltText(imageWithoutCaption);
      expect(altText).toBe('Gallery image');
    });

    it('includes image number when specified', () => {
      const altText = generateAltText(mockImage, {
        includeImageNumber: true,
        index: 5,
      });
      
      expect(altText).toBe('Image 6: A beautiful sunset over the ocean');
    });

    it('generates numbered fallback when caption missing and index provided', () => {
      const imageWithoutCaption: GalleryImage = {
        ...mockImage,
        caption: undefined,
      };
      
      const altText = generateAltText(imageWithoutCaption, {
        index: 2,
      });
      
      expect(altText).toBe('Gallery image 3');
    });

    it('trims whitespace from caption', () => {
      const imageWithWhitespace: GalleryImage = {
        ...mockImage,
        caption: '  A beautiful sunset  ',
      };
      
      const altText = generateAltText(imageWithWhitespace);
      expect(altText).toBe('A beautiful sunset');
    });

    it('handles empty string caption', () => {
      const imageWithEmptyCaption: GalleryImage = {
        ...mockImage,
        caption: '',
      };
      
      const altText = generateAltText(imageWithEmptyCaption);
      expect(altText).toBe('Gallery image');
    });

    it('uses custom fallback text', () => {
      const imageWithoutCaption: GalleryImage = {
        ...mockImage,
        caption: undefined,
      };
      
      const altText = generateAltText(imageWithoutCaption, {
        fallback: 'Photo',
      });
      
      expect(altText).toBe('Photo');
    });
  });

  describe('isDecorativeImage', () => {
    it('returns false for images with captions', () => {
      expect(isDecorativeImage(mockImage)).toBe(false);
    });

    it('returns false for images without captions (not decorative in gallery context)', () => {
      const imageWithoutCaption: GalleryImage = {
        ...mockImage,
        caption: undefined,
      };
      
      expect(isDecorativeImage(imageWithoutCaption)).toBe(false);
    });
  });

  describe('getImageAltText', () => {
    it('returns caption if available', () => {
      const altText = getImageAltText(mockImage);
      expect(altText).toBe('A beautiful sunset over the ocean');
    });

    it('returns fallback if caption missing', () => {
      const imageWithoutCaption: GalleryImage = {
        ...mockImage,
        caption: undefined,
      };
      
      const altText = getImageAltText(imageWithoutCaption);
      expect(altText).toBe('Gallery image');
    });

    it('returns empty string for decorative images', () => {
      // Currently no decorative images, but if added in future
      // This would return empty string
      const altText = getImageAltText(mockImage);
      expect(altText).not.toBe('');
    });
  });
});