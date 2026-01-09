import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GalleryItem } from './GalleryItem';
import type { GalleryImage } from '../../../../types/gallery';
import { FavoritesProvider } from '../../../../contexts/FavoritesContext';

const mockImage: GalleryImage = {
  id: 1,
  cloudinary_url: 'https://res.cloudinary.com/test/image.jpg',
  caption: 'Test image caption',
  display_order: 1,
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<FavoritesProvider>{ui}</FavoritesProvider>);
};

describe('GalleryItem', () => {
  it('renders image with correct attributes', () => {
    renderWithProvider(<GalleryItem image={mockImage} />);

    const img = screen.getByAltText('Test image caption');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('renders caption when provided', () => {
    renderWithProvider(<GalleryItem image={mockImage} />);

    expect(screen.getByText('Test image caption')).toBeInTheDocument();
  });

  it('does not render caption when not provided', () => {
    const imageWithoutCaption: GalleryImage = {
      ...mockImage,
      caption: undefined,
    };

    renderWithProvider(<GalleryItem image={imageWithoutCaption} />);

    expect(screen.queryByText('Test image caption')).not.toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const mockOnClick = vi.fn();
    renderWithProvider(<GalleryItem image={mockImage} onClick={mockOnClick} />);

    const item = screen.getByRole('img').parentElement?.parentElement;
    fireEvent.click(item!);

    expect(mockOnClick).toHaveBeenCalled();
    expect(mockOnClick.mock.calls[0][0]).toEqual(mockImage);
  });

  it('has proper accessibility attributes', () => {
    renderWithProvider(<GalleryItem image={mockImage} />);

    const img = screen.getByAltText('Test image caption');
    expect(img).toHaveAttribute('alt');
  });

  it('uses default alt text when no caption', () => {
    const imageWithoutCaption: GalleryImage = {
      ...mockImage,
      caption: undefined,
    };

    renderWithProvider(<GalleryItem image={imageWithoutCaption} />);

    expect(screen.getByAltText('Gallery image')).toBeInTheDocument();
  });

  it('is keyboard accessible with tabIndex', () => {
    renderWithProvider(<GalleryItem image={mockImage} />);

    const item = screen.getAllByRole('button')[0];
    expect(item).toHaveAttribute('tabIndex', '0');
  });

  it('has proper ARIA label', () => {
    renderWithProvider(<GalleryItem image={mockImage} />);

    const item = screen.getByRole('button', { name: /View image: Test image caption/i });
    expect(item).toHaveAttribute('aria-label', 'View image: Test image caption');
  });

  it('opens lightbox on Enter key', () => {
    const mockOnClick = vi.fn();
    renderWithProvider(<GalleryItem image={mockImage} onClick={mockOnClick} />);

    const item = screen.getByRole('button', { name: /View image: Test image caption/i });
    fireEvent.keyDown(item, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalled();
    expect(mockOnClick.mock.calls[0][0]).toEqual(mockImage);
  });

  it('opens lightbox on Space key', () => {
    const mockOnClick = vi.fn();
    renderWithProvider(<GalleryItem image={mockImage} onClick={mockOnClick} />);

    const item = screen.getByRole('button', { name: /View image: Test image caption/i });
    fireEvent.keyDown(item, { key: ' ' });

    expect(mockOnClick).toHaveBeenCalled();
    expect(mockOnClick.mock.calls[0][0]).toEqual(mockImage);
  });

  it('handles keyboard interaction', () => {
    const mockOnClick = vi.fn();
    renderWithProvider(<GalleryItem image={mockImage} onClick={mockOnClick} />);

    const item = screen.getByRole('button', { name: /View image: Test image caption/i });

    // Test that both Enter and Space trigger the click
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(item, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });
});
