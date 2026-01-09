import { describe, it, expect } from 'vitest';
import {
  buildCloudinaryTransform,
  generateOptimizedImageUrl,
  generateSrcset,
  generateSizesAttribute,
  getResponsiveSizes,
  generateResponsiveImageProps,
  generateLQIPUrl,
  generateImageWithLQIPProps,
} from './imageUtils';

describe('imageUtils', () => {
  const testUrl = 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg';

  describe('buildCloudinaryTransform', () => {
    it('builds transformation string with all options', () => {
      const result = buildCloudinaryTransform({
        width: 800,
        quality: 'auto',
        format: 'webp',
        crop: 'fill',
        gravity: 'face',
      });

      expect(result).toBe('w_800,q_auto,f_webp,c_fill,g_face');
    });

    it('builds transformation string with partial options', () => {
      const result = buildCloudinaryTransform({
        width: 400,
        quality: 80,
      });

      expect(result).toBe('w_400,q_80');
    });

    it('returns empty string when no options provided', () => {
      const result = buildCloudinaryTransform({});

      expect(result).toBe('');
    });
  });

  describe('generateOptimizedImageUrl', () => {
    it('generates optimized URL with default transformations', () => {
      const result = generateOptimizedImageUrl(testUrl, {
        quality: 'auto',
        format: 'auto',
        crop: 'scale',
      });

      expect(result).toContain(testUrl);
      expect(result).toContain('q_auto');
      expect(result).toContain('f_auto');
      expect(result).toContain('c_scale');
    });

    it('handles URLs with existing query parameters', () => {
      const urlWithParams = `${testUrl}?existing=param`;
      const result = generateOptimizedImageUrl(urlWithParams, {
        quality: 'auto',
        format: 'auto',
      });

      expect(result).toContain(testUrl);
      expect(result).toContain('q_auto');
      expect(result).toContain('f_auto');
      // Should not contain the existing param in the final URL
      expect(result).not.toContain('existing=param');
    });
  });

  describe('generateSrcset', () => {
    it('generates srcset string with multiple sizes', () => {
      const sizes = [
        { width: 320 },
        { width: 640 },
        { width: 1024 },
      ];

      const result = generateSrcset(testUrl, sizes);

      expect(result).toContain('320w');
      expect(result).toContain('640w');
      expect(result).toContain('1024w');
      expect(result).toMatch(/,/g); // Should contain commas separating sizes
    });
  });

  describe('generateSizesAttribute', () => {
    it('generates responsive sizes attribute', () => {
      const result = generateSizesAttribute();

      expect(result).toContain('100vw');
      expect(result).toContain('50vw');
      expect(result).toContain('33vw');
      expect(result).toContain('25vw');
      expect(result).toMatch(/\(/g); // Should contain media queries
    });
  });

  describe('getResponsiveSizes', () => {
    it('returns array of responsive sizes', () => {
      const sizes = getResponsiveSizes();

      expect(Array.isArray(sizes)).toBe(true);
      expect(sizes.length).toBeGreaterThan(0);
      expect(sizes[0]).toHaveProperty('width');
      expect(typeof sizes[0].width).toBe('number');
    });

    it('includes expected breakpoints', () => {
      const sizes = getResponsiveSizes();

      const widths = sizes.map(s => s.width);
      expect(widths).toContain(320);
      expect(widths).toContain(768);
      expect(widths).toContain(1024);
      expect(widths).toContain(1280);
    });
  });

  describe('generateResponsiveImageProps', () => {
    it('returns complete image props object', () => {
      const props = generateResponsiveImageProps(testUrl);

      expect(props).toHaveProperty('src');
      expect(props).toHaveProperty('srcSet');
      expect(props).toHaveProperty('sizes');
      expect(typeof props.src).toBe('string');
      expect(typeof props.srcSet).toBe('string');
      expect(typeof props.sizes).toBe('string');
    });

    it('includes Cloudinary optimizations in src', () => {
      const props = generateResponsiveImageProps(testUrl);

      expect(props.src).toContain('q_auto');
      expect(props.src).toContain('f_auto');
      expect(props.src).toContain('c_scale');
    });

    it('generates srcset with multiple sizes', () => {
      const props = generateResponsiveImageProps(testUrl);

      expect(props.srcSet).toMatch(/\d+w/g); // Should contain width descriptors
      expect(props.srcSet.split(',').length).toBeGreaterThan(1); // Multiple sizes
    });
  });

  describe('generateLQIPUrl', () => {
    it('generates LQIP URL with blur and low quality transformations', () => {
      const lqipUrl = generateLQIPUrl(testUrl);

      expect(lqipUrl).toContain(testUrl);
      expect(lqipUrl).toContain('w_50'); // Small width
      expect(lqipUrl).toContain('q_1'); // Lowest quality
      expect(lqipUrl).toContain('f_auto'); // Auto format
      expect(lqipUrl).toContain('c_scale'); // Scale crop
      expect(lqipUrl).toContain('e_blur:1000'); // Maximum blur
    });

    it('handles URLs with existing query parameters', () => {
      const urlWithParams = `${testUrl}?existing=param`;
      const lqipUrl = generateLQIPUrl(urlWithParams);

      expect(lqipUrl).toContain(testUrl);
      expect(lqipUrl).toContain('e_blur:1000');
      // Should not contain the existing param in the final URL
      expect(lqipUrl).not.toContain('existing=param');
    });
  });

  describe('generateImageWithLQIPProps', () => {
    it('returns complete image props with LQIP URL', () => {
      const props = generateImageWithLQIPProps(testUrl);

      expect(props).toHaveProperty('src');
      expect(props).toHaveProperty('srcSet');
      expect(props).toHaveProperty('sizes');
      expect(props).toHaveProperty('lqipUrl');
      expect(typeof props.lqipUrl).toBe('string');
      expect(props.lqipUrl).toContain('e_blur:1000');
    });

    it('LQIP URL is different from main image URL', () => {
      const props = generateImageWithLQIPProps(testUrl);

      expect(props.lqipUrl).not.toBe(props.src);
      expect(props.lqipUrl).toContain('w_50');
      expect(props.src).toContain('w_640'); // Default responsive size
    });
  });
});