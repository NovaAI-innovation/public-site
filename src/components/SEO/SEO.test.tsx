import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { SEO, GalleryImageSEO } from './SEO';
import type { GalleryImage } from '../../types/gallery';

// Helper function to get meta tag from document head
const getMetaTag = (attribute: string, value: string): HTMLMetaElement | null => {
  const metas = Array.from(document.head.querySelectorAll('meta'));
  return metas.find(
    (meta) => meta.getAttribute(attribute) === value
  ) as HTMLMetaElement | null;
};

// Mock HelmetProvider for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

describe('SEO', () => {
  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    // Clear document head after each test
    document.head.innerHTML = '';
  });

  it('renders default metadata', async () => {
    render(<SEO />, { wrapper });

    await waitFor(() => {
      const title = document.head.querySelector('title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('Gallery');
    });
  });

  it('renders custom title', async () => {
    render(<SEO title="Custom Title" />, { wrapper });

    await waitFor(() => {
      const title = document.head.querySelector('title');
      expect(title?.textContent).toBe('Custom Title');
    });
  });

  it('renders custom description', async () => {
    render(<SEO description="Custom description" />, { wrapper });

    await waitFor(() => {
      const metaDescription = getMetaTag('name', 'description');
      expect(metaDescription?.getAttribute('content')).toBe('Custom description');
    });
  });

  it('renders Open Graph tags', async () => {
    render(
      <SEO
        title="OG Title"
        description="OG Description"
        image="/og-image.jpg"
        url="/test"
      />,
      { wrapper }
    );

    await waitFor(() => {
      const ogTitle = getMetaTag('property', 'og:title');
      expect(ogTitle?.getAttribute('content')).toBe('OG Title');

      const ogDescription = getMetaTag('property', 'og:description');
      expect(ogDescription?.getAttribute('content')).toBe('OG Description');

      const ogImage = getMetaTag('property', 'og:image');
      expect(ogImage?.getAttribute('content')).toContain('/og-image.jpg');
    });
  });

  it('renders Twitter Card tags', async () => {
    render(
      <SEO
        title="Twitter Title"
        description="Twitter Description"
        image="/twitter-image.jpg"
      />,
      { wrapper }
    );

    await waitFor(() => {
      const twitterCard = getMetaTag('name', 'twitter:card');
      expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');

      const twitterTitle = getMetaTag('name', 'twitter:title');
      expect(twitterTitle?.getAttribute('content')).toBe('Twitter Title');
    });
  });
});

describe('GalleryImageSEO', () => {
  const mockImage: GalleryImage = {
    id: 1,
    cloudinary_url: 'https://res.cloudinary.com/example/image/upload/test.jpg',
    caption: 'Test Image Caption',
    display_order: 1,
  };

  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = '';
    // Mock window.location.origin for tests
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
      },
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    // Clear document head after each test
    document.head.innerHTML = '';
  });

  it('renders metadata for gallery image', async () => {
    render(<GalleryImageSEO image={mockImage} />, { wrapper });

    await waitFor(() => {
      const title = document.head.querySelector('title');
      expect(title?.textContent).toBe('Test Image Caption');

      const ogImage = getMetaTag('property', 'og:image');
      expect(ogImage?.getAttribute('content')).toBe(mockImage.cloudinary_url);
    });
  });

  it('generates title from caption', async () => {
    const imageWithCaption: GalleryImage = {
      ...mockImage,
      caption: 'Beautiful Landscape',
    };

    render(<GalleryImageSEO image={imageWithCaption} />, { wrapper });

    await waitFor(() => {
      const title = document.head.querySelector('title');
      expect(title?.textContent).toBe('Beautiful Landscape');
    });
  });

  it('generates fallback title when caption is missing', async () => {
    const imageWithoutCaption: GalleryImage = {
      ...mockImage,
      caption: '',
    };

    render(<GalleryImageSEO image={imageWithoutCaption} />, { wrapper });

    await waitFor(() => {
      const title = document.head.querySelector('title');
      expect(title?.textContent).toBe('Gallery Image #1');
    });
  });

  it('uses Cloudinary image URL for og:image', async () => {
    const imageWithCloudinary: GalleryImage = {
      ...mockImage,
      cloudinary_url: 'https://res.cloudinary.com/example/image/upload/v123/test.jpg',
    };

    render(<GalleryImageSEO image={imageWithCloudinary} />, { wrapper });

    await waitFor(() => {
      const ogImage = getMetaTag('property', 'og:image');
      expect(ogImage?.getAttribute('content')).toBe(imageWithCloudinary.cloudinary_url);
    });
  });
});
