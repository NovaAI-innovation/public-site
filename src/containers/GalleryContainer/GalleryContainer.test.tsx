import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GalleryContainer } from './GalleryContainer';
import { BrowserRouter } from 'react-router-dom';
import { useGalleryImagesInfinite } from '../../api/hooks/useGalleryImagesInfinite';

// Mock the GalleryGrid component
vi.mock('../../components/features/gallery/GalleryGrid/GalleryGrid', () => ({
  GalleryGrid: ({ images, onImageClick }: any) => (
    <div data-testid="gallery-grid">
      <p>Mock Gallery Grid with {images.length} images</p>
      <button
        data-testid="image-click"
        onClick={() => onImageClick?.(images[0])}
      >
        Click Image
      </button>
    </div>
  ),
}));

// Mock the GalleryIndicators component
vi.mock('../../components/features/gallery/GalleryIndicators/GalleryIndicators', () => ({
  GalleryIndicators: () => <div data-testid="gallery-indicators">Mock Indicators</div>,
}));

// Mock the Lightbox component
vi.mock('../../components/features/lightbox/Lightbox/Lightbox', () => ({
  Lightbox: () => <div data-testid="lightbox">Mock Lightbox</div>,
}));

// Mock SEO component
vi.mock('../../components/SEO/SEO', () => ({
  GalleryImageSEO: () => null,
}));

// Mock the API hook
vi.mock('../../api/hooks/useGalleryImagesInfinite', () => ({
  useGalleryImagesInfinite: vi.fn(),
  flattenGalleryImages: vi.fn((data) => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page: any) => page.images);
  }),
}));

// Mock the hooks
vi.mock('../../hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: vi.fn(() => ({ current: null })),
}));

vi.mock('../../hooks/useLightbox', () => ({
  useLightbox: vi.fn(() => ({
    isOpen: false,
    currentImage: null,
    currentIndex: 0,
    open: vi.fn(),
    close: vi.fn(),
    goToNext: vi.fn(),
    goToPrevious: vi.fn(),
    hasNext: false,
    hasPrevious: false,
  })),
}));

vi.mock('../../hooks/useSwipe', () => ({
  useSwipe: vi.fn(() => ({
    onTouchStart: vi.fn(),
    onTouchEnd: vi.fn(),
  })),
}));

describe('GalleryContainer', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );

  it('renders loading state', () => {
    const mockUseGalleryImagesInfinite = vi.mocked(useGalleryImagesInfinite);
    mockUseGalleryImagesInfinite.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: false,
      status: 'pending',
      fetchStatus: 'idle',
      isRefetching: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isStale: false,
      isSuccess: false,
      refetchOnWindowFocus: vi.fn(),
    } as any);

    render(<GalleryContainer />, { wrapper });

    expect(screen.getByText('Loading gallery...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const mockRefetch = vi.fn();
    const mockUseGalleryImagesInfinite = vi.mocked(useGalleryImagesInfinite);
    mockUseGalleryImagesInfinite.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: mockRefetch,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: false,
      status: 'error',
      fetchStatus: 'idle',
      isRefetching: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isStale: false,
      isSuccess: false,
      refetchOnWindowFocus: vi.fn(),
    } as any);

    render(<GalleryContainer />, { wrapper });

    expect(screen.getByText('Failed to load gallery')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders gallery grid with data', () => {
    const mockData = {
      pages: [
        {
          images: [
            {
              id: 1,
              cloudinary_url: 'https://example.com/image1.jpg',
              caption: 'Test image',
              display_order: 1,
            },
          ],
          pagination: {
            has_more: false,
            total_count: 1,
          },
        },
      ],
      pageParams: [undefined],
    };

    const mockUseGalleryImagesInfinite = vi.mocked(useGalleryImagesInfinite);
    mockUseGalleryImagesInfinite.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: false,
      status: 'success',
      fetchStatus: 'idle',
      isRefetching: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isStale: false,
      isSuccess: true,
      refetchOnWindowFocus: vi.fn(),
    } as any);

    render(<GalleryContainer />, { wrapper });

    expect(screen.getByTestId('gallery-grid')).toBeInTheDocument();
    expect(screen.getByText('Mock Gallery Grid with 1 images')).toBeInTheDocument();
  });

  it('passes onImageClick prop to GalleryGrid', () => {
    const mockOnImageClick = vi.fn();
    const mockImage = {
      id: 1,
      cloudinary_url: 'https://example.com/image1.jpg',
      caption: 'Test image',
      display_order: 1,
    };
    const mockData = {
      pages: [
        {
          images: [mockImage],
          pagination: {
            has_more: false,
            total_count: 1,
          },
        },
      ],
      pageParams: [undefined],
    };

    const mockUseGalleryImagesInfinite = vi.mocked(useGalleryImagesInfinite);
    mockUseGalleryImagesInfinite.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: false,
      status: 'success',
      fetchStatus: 'idle',
      isRefetching: false,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isStale: false,
      isSuccess: true,
      refetchOnWindowFocus: vi.fn(),
    } as any);

    render(<GalleryContainer onImageClick={mockOnImageClick} />, { wrapper });

    const imageClickButton = screen.getByTestId('image-click');
    fireEvent.click(imageClickButton);

    expect(mockOnImageClick).toHaveBeenCalledWith(mockImage);
  });

  it('passes limit prop to useGalleryImagesInfinite hook', () => {
    const mockUseGalleryImagesInfinite = vi.mocked(useGalleryImagesInfinite);
    mockUseGalleryImagesInfinite.mockClear();

    render(<GalleryContainer limit={10} />, { wrapper });

    expect(mockUseGalleryImagesInfinite).toHaveBeenCalledWith(10);
  });
});
