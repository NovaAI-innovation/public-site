import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ImageSkeleton } from './ImageSkeleton';

describe('ImageSkeleton', () => {
  it('renders with default aspect ratio', () => {
    render(<ImageSkeleton />);

    const skeleton = screen.getByTestId('image-skeleton');
    expect(skeleton.className).toMatch(/imageSkeleton/);
    expect(skeleton).toHaveStyle({ aspectRatio: '4 / 3' });
  });

  it('applies custom aspect ratio', () => {
    render(<ImageSkeleton aspectRatio="16 / 9" />);

    const skeleton = screen.getByTestId('image-skeleton');
    expect(skeleton).toHaveStyle({ aspectRatio: '16 / 9' });
  });

  it('applies custom className', () => {
    render(<ImageSkeleton className="custom-class" />);

    const skeleton = screen.getByTestId('image-skeleton');
    expect(skeleton.className).toMatch(/custom-class/);
  });

  it('has shimmer animation', () => {
    render(<ImageSkeleton />);

    const skeleton = screen.getByTestId('image-skeleton');
    const shimmerElements = skeleton.querySelectorAll('[class*="shimmer"]');
    expect(shimmerElements.length).toBeGreaterThan(0);
  });
});
