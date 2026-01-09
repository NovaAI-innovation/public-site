import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImageError } from './ImageError';

describe('ImageError', () => {
  it('renders error message', () => {
    render(<ImageError />);

    expect(screen.getByText(/unable to load image|image failed to load/i)).toBeInTheDocument();
  });

  it('displays custom error message', () => {
    render(<ImageError message="Custom error message" />);

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('shows retry button when onRetry provided and retries available', () => {
    const mockOnRetry = vi.fn();
    render(<ImageError onRetry={mockOnRetry} retryCount={0} />);

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
  });

  it('hides retry button when max retries reached', () => {
    const mockOnRetry = vi.fn();
    render(<ImageError onRetry={mockOnRetry} retryCount={3} maxRetries={3} />);

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', () => {
    const mockOnRetry = vi.fn();
    render(<ImageError onRetry={mockOnRetry} retryCount={0} />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<ImageError />);

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('retry button has aria-label', () => {
    const mockOnRetry = vi.fn();
    render(<ImageError onRetry={mockOnRetry} retryCount={0} />);

    const retryButton = screen.getByLabelText('Retry loading image');
    expect(retryButton).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ImageError className="custom-class" />);

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveClass('custom-class');
  });

  it('shows different message when max retries reached', () => {
    render(<ImageError retryCount={3} maxRetries={3} />);

    expect(screen.getByText('Unable to load image')).toBeInTheDocument();
  });
});