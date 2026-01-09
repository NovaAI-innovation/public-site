import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <HelmetProvider>
        <BrowserRouter>{component}</BrowserRouter>
      </HelmetProvider>
    );
  };

  it('renders 404 heading', () => {
    renderWithRouter(<NotFoundPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/404/i);
  });

  it('displays user-friendly error message', () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it('renders link to gallery', () => {
    renderWithRouter(<NotFoundPage />);
    const galleryLink = screen.getByRole('link', { name: /back to gallery/i });
    expect(galleryLink).toHaveAttribute('href', '/gallery');
  });

  it('renders link to home', () => {
    renderWithRouter(<NotFoundPage />);
    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('has proper heading structure for accessibility', () => {
    renderWithRouter(<NotFoundPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    // Check that h1 is the main heading (not nested in another heading)
    expect(h1.tagName).toBe('H1');
  });

  it('links are keyboard navigable', () => {
    renderWithRouter(<NotFoundPage />);
    const galleryLink = screen.getByRole('link', { name: /back to gallery/i });
    const homeLink = screen.getByRole('link', { name: /go home/i });
    
    // React Router Link components are keyboard navigable by default
    expect(galleryLink).toBeInTheDocument();
    expect(homeLink).toBeInTheDocument();
    // Links should be focusable (tabIndex of 0 or no tabIndex means default focusable)
    expect(galleryLink).not.toHaveAttribute('tabIndex', '-1');
    expect(homeLink).not.toHaveAttribute('tabIndex', '-1');
  });

  it('has data-testid for testing', () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });

  it('is screen reader friendly with proper ARIA attributes', () => {
    renderWithRouter(<NotFoundPage />);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
});
