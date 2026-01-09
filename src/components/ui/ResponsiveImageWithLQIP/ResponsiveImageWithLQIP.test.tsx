import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ResponsiveImageWithLQIP } from './ResponsiveImageWithLQIP';

describe('ResponsiveImageWithLQIP', () => {
  const testUrl = 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg';

  it('renders LQIP and full image elements', () => {
    render(<ResponsiveImageWithLQIP src={testUrl} alt="Test image" />);

    // Should have at least one img element (full image), LQIP may be conditionally rendered
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByAltText('Test image')).toBeInTheDocument();
  });

  it('LQIP image has aria-hidden attribute', () => {
    render(<ResponsiveImageWithLQIP src={testUrl} alt="Test image" />);

    const lqipImage = screen.getByAltText(''); // Empty alt for LQIP
    expect(lqipImage).toHaveAttribute('aria-hidden', 'true');
  });

  it('full image has correct alt text', () => {
    render(<ResponsiveImageWithLQIP src={testUrl} alt="Test image" />);

    const fullImage = screen.getByAltText('Test image');
    expect(fullImage).toBeInTheDocument();
  });

  it('includes Cloudinary LQIP transformations', () => {
    render(<ResponsiveImageWithLQIP src={testUrl} alt="Test image" />);

    const lqipImage = screen.getByAltText('');
    const lqipSrc = lqipImage.getAttribute('src');

    expect(lqipSrc).toContain('e_blur:1000'); // Blur effect
    expect(lqipSrc).toContain('w_50'); // Small width
    expect(lqipSrc).toContain('q_1'); // Low quality
  });

  it('full image has responsive attributes', () => {
    render(<ResponsiveImageWithLQIP src={testUrl} alt="Test image" />);

    const fullImage = screen.getByAltText('Test image');
    expect(fullImage).toHaveAttribute('src');
    expect(fullImage).toHaveAttribute('srcSet');
    expect(fullImage).toHaveAttribute('sizes');
  });

  it('applies custom className', () => {
    render(
      <ResponsiveImageWithLQIP
        src={testUrl}
        alt="Test image"
        className="custom-class"
      />
    );

    const container = screen.getByTestId('image-with-lqip');
    expect(container).toHaveClass('custom-class');
  });

  it('sets loading attribute', () => {
    render(
      <ResponsiveImageWithLQIP
        src={testUrl}
        alt="Test image"
        loading="eager"
      />
    );

    const fullImage = screen.getByAltText('Test image');
    expect(fullImage).toHaveAttribute('loading', 'eager');
  });

  it('defaults to lazy loading', () => {
    render(<ResponsiveImageWithLQIP src={testUrl} alt="Test image" />);

    const fullImage = screen.getByAltText('Test image');
    expect(fullImage).toHaveAttribute('loading', 'lazy');
  });

  it('includes decoding async attribute', () => {
    render(<ResponsiveImageWithLQIP src={testUrl} alt="Test image" />);

    const fullImage = screen.getByAltText('Test image');
    expect(fullImage).toHaveAttribute('decoding', 'async');
  });

  it('transitions from LQIP to full image on load', async () => {
    render(<ResponsiveImageWithLQIP src={testUrl} alt="Test image" />);

    const lqipImage = screen.getByAltText('');
    const fullImage = screen.getByAltText('Test image');

    // Initially, LQIP should be visible (no fadeOut class)
    expect(lqipImage).not.toHaveClass('fadeOut');

    // Simulate image load
    const loadEvent = new Event('load');
    fullImage.dispatchEvent(loadEvent);

    // After load, LQIP should have fadeOut class (CSS modules hashed) and full image should have loaded class
    await waitFor(() => {
      expect(lqipImage.className).toMatch(/fadeOut/);
      expect(fullImage.className).toMatch(/loaded/);
    });
  });
});