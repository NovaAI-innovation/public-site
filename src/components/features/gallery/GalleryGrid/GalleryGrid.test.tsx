import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GalleryGrid } from './GalleryGrid';
import type { GalleryImage } from '../../../../types/gallery';
import { FavoritesProvider } from '../../../../contexts/FavoritesContext';

const mockImages: GalleryImage[] = [
  {
    id: 1,
    cloudinary_url: 'https://res.cloudinary.com/test/image1.jpg',
    caption: 'Image 1',
    display_order: 1,
  },
  {
    id: 2,
    cloudinary_url: 'https://res.cloudinary.com/test/image2.jpg',
    caption: 'Image 2',
    display_order: 2,
  },
  {
    id: 3,
    cloudinary_url: 'https://res.cloudinary.com/test/image3.jpg',
    caption: 'Image 3',
    display_order: 3,
  },
];

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<FavoritesProvider>{ui}</FavoritesProvider>);
};

describe('GalleryGrid', () => {
  it('renders all images', () => {
    renderWithProvider(<GalleryGrid images={mockImages} />);

    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
    expect(screen.getByAltText('Image 3')).toBeInTheDocument();
  });

  it('passes onImageClick to GalleryItem components', () => {
    const mockOnClick = vi.fn();
    renderWithProvider(<GalleryGrid images={mockImages} onImageClick={mockOnClick} />);

    const firstImage = screen.getByAltText('Image 1');
    const itemContainer = firstImage.closest('[class*="galleryItem"]');
    fireEvent.click(itemContainer!);

    expect(mockOnClick).toHaveBeenCalled();
    expect(mockOnClick.mock.calls[0][0]).toEqual(mockImages[0]);
  });

  it('has correct CSS classes for grid layout', () => {
    renderWithProvider(<GalleryGrid images={mockImages} />);

    const grid = screen.getByTestId('gallery-grid');
    // CSS Modules generates hashed class names, so we check that it has a class starting with galleryGrid
    expect(grid.className).toMatch(/galleryGrid/);
  });

  it('renders empty state when no images provided', () => {
    renderWithProvider(<GalleryGrid images={[]} />);

    expect(screen.getByText('No images available')).toBeInTheDocument();
  });

  it('renders empty state when images array is empty', () => {
    renderWithProvider(<GalleryGrid images={[]} />);

    expect(screen.getByText('No images available')).toBeInTheDocument();
  });


  it('renders captions for images', () => {
    renderWithProvider(<GalleryGrid images={mockImages} />);

    expect(screen.getByText('Image 1')).toBeInTheDocument();
    expect(screen.getByText('Image 2')).toBeInTheDocument();
    expect(screen.getByText('Image 3')).toBeInTheDocument();
  });
});
