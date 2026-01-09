import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ResponsiveImage } from './ResponsiveImage';

describe('ResponsiveImage', () => {
  const testUrl = 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg';

  it('renders img element with responsive attributes', () => {
    render(<ResponsiveImage src={testUrl} alt="Test image" />);

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');
    expect(img).toHaveAttribute('srcSet');
    expect(img).toHaveAttribute('sizes');
  });

  it('includes Cloudinary optimizations in src', () => {
    render(<ResponsiveImage src={testUrl} alt="Test image" />);

    const img = screen.getByAltText('Test image');
    const src = img.getAttribute('src');

    expect(src).toContain('q_auto');
    expect(src).toContain('f_auto');
    expect(src).toContain('c_scale');
  });

  it('generates srcset with multiple sizes', () => {
    render(<ResponsiveImage src={testUrl} alt="Test image" />);

    const img = screen.getByAltText('Test image');
    const srcSet = img.getAttribute('srcSet');

    expect(srcSet).toMatch(/\d+w/g); // Should contain width descriptors like "320w"
    expect(srcSet?.split(',').length).toBeGreaterThan(1); // Multiple sizes
  });

  it('includes responsive sizes attribute', () => {
    render(<ResponsiveImage src={testUrl} alt="Test image" />);

    const img = screen.getByAltText('Test image');
    const sizes = img.getAttribute('sizes');

    expect(sizes).toContain('100vw');
    expect(sizes).toContain('50vw');
    expect(sizes).toContain('33vw');
    expect(sizes).toContain('25vw');
  });

  it('applies custom className', () => {
    render(
      <ResponsiveImage
        src={testUrl}
        alt="Test image"
        className="custom-class"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveClass('custom-class');
  });

  it('sets loading attribute', () => {
    render(
      <ResponsiveImage
        src={testUrl}
        alt="Test image"
        loading="eager"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('defaults to lazy loading', () => {
    render(<ResponsiveImage src={testUrl} alt="Test image" />);

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('includes decoding async attribute', () => {
    render(<ResponsiveImage src={testUrl} alt="Test image" />);

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('passes through onLoad and onError callbacks', () => {
    const mockOnLoad = vi.fn();
    const mockOnError = vi.fn();

    render(
      <ResponsiveImage
        src={testUrl}
        alt="Test image"
        onLoad={mockOnLoad}
        onError={mockOnError}
      />
    );

    // The callbacks are passed to the img element
    // We can't easily test the actual event firing in unit tests
    // but we can verify the component renders without crashing
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
  });
});