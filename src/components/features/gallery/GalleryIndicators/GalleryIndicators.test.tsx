import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GalleryIndicators } from './GalleryIndicators';
import type { GalleryImage } from '../../../types/gallery';

const mockImages: GalleryImage[] = [
  { id: 1, cloudinary_url: 'https://example.com/image1.jpg', caption: 'Image 1', display_order: 1 },
  { id: 2, cloudinary_url: 'https://example.com/image2.jpg', caption: 'Image 2', display_order: 2 },
  { id: 3, cloudinary_url: 'https://example.com/image3.jpg', caption: 'Image 3', display_order: 3 },
];

describe('GalleryIndicators', () => {
  it('renders dots for less than 10 images', () => {
    render(<GalleryIndicators images={mockImages} />);

    const dots = screen.getAllByRole('tab');
    expect(dots).toHaveLength(3);
  });

  it('renders counter for 10+ images', () => {
    const manyImages = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      cloudinary_url: `https://example.com/image${i + 1}.jpg`,
      caption: `Image ${i + 1}`,
      display_order: i + 1,
    }));

    render(<GalleryIndicators images={manyImages} />);

    const counter = screen.getByRole('status');
    expect(counter).toBeInTheDocument();
    expect(counter).toHaveTextContent('1 of 15');
  });

  it('calls onNavigateTo when dot is clicked', () => {
    const mockOnNavigateTo = vi.fn();
    render(<GalleryIndicators images={mockImages} onNavigateTo={mockOnNavigateTo} />);

    const dots = screen.getAllByRole('tab');
    fireEvent.click(dots[1]);

    expect(mockOnNavigateTo).toHaveBeenCalledWith(1);
  });

  it('has proper ARIA labels for dots', () => {
    render(<GalleryIndicators images={mockImages} />);

    const dots = screen.getAllByRole('tab');
    expect(dots[0]).toHaveAttribute('aria-label', 'Navigate to image 1 of 3');
    expect(dots[1]).toHaveAttribute('aria-label', 'Navigate to image 2 of 3');
  });

  it('has keyboard navigation support', () => {
    const mockOnNavigateTo = vi.fn();
    render(<GalleryIndicators images={mockImages} onNavigateTo={mockOnNavigateTo} />);

    const dots = screen.getAllByRole('tab');
    fireEvent.keyDown(dots[0], { key: 'ArrowRight' });

    expect(mockOnNavigateTo).toHaveBeenCalledWith(1);
  });

  it('handles Enter key on dot', () => {
    const mockOnNavigateTo = vi.fn();
    render(<GalleryIndicators images={mockImages} onNavigateTo={mockOnNavigateTo} />);

    const dots = screen.getAllByRole('tab');
    fireEvent.keyDown(dots[1], { key: 'Enter' });

    expect(mockOnNavigateTo).toHaveBeenCalledWith(1);
  });

  it('marks active dot with active class', () => {
    render(<GalleryIndicators images={mockImages} />);

    const dots = screen.getAllByRole('tab');
    // First dot should be active by default
    expect(dots[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('does not render when images array is empty', () => {
    const { container } = render(<GalleryIndicators images={[]} />);
    expect(container.firstChild).toBeNull();
  });
});