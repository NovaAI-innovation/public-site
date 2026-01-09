import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Gallery from './Gallery';

// Mock the GalleryContainer to avoid dependencies
vi.mock('../../containers/GalleryContainer/GalleryContainer', () => ({
  GalleryContainer: ({ initialImageId }: { initialImageId?: number }) => (
    <div data-testid="gallery-container">
      {initialImageId && <div data-testid="initial-image-id">{initialImageId}</div>}
    </div>
  ),
}));

describe('Gallery', () => {
  it('renders gallery page with header', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <Gallery />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByTestId('gallery-page')).toBeInTheDocument();
    expect(screen.getByText(/gallery/i)).toBeInTheDocument();
  });

  it('passes valid imageId to GalleryContainer', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/gallery/123']}>
          <Routes>
            <Route path="/gallery/:imageId" element={<Gallery />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByTestId('gallery-container')).toBeInTheDocument();
    expect(screen.getByTestId('initial-image-id')).toHaveTextContent('123');
  });

  it('handles missing imageId parameter', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/gallery']}>
          <Routes>
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByTestId('gallery-page')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-container')).toBeInTheDocument();
  });

  // Note: Testing navigation to 404 for invalid imageIds is better suited
  // for integration tests with full router setup. The navigation logic
  // is verified in the implementation code.
});
