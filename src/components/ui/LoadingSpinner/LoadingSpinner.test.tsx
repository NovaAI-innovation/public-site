import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner and message', () => {
    const { container } = render(<LoadingSpinner message="Loading..." />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    const spinnerContainer = container.firstChild as HTMLElement;
    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer.className).toMatch(/loadingSpinner/);
  });

  it('renders without message', () => {
    const { container } = render(<LoadingSpinner />);

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    const spinnerContainer = container.firstChild as HTMLElement;
    expect(spinnerContainer).toBeInTheDocument();
    expect(spinnerContainer.className).toMatch(/loadingSpinner/);
  });

  it('applies size classes', () => {
    const { container, rerender } = render(<LoadingSpinner size="small" />);
    let spinnerContainer = container.firstChild as HTMLElement;
    expect(spinnerContainer.className).toMatch(/small/);

    rerender(<LoadingSpinner size="medium" />);
    spinnerContainer = container.firstChild as HTMLElement;
    expect(spinnerContainer.className).toMatch(/medium/);

    rerender(<LoadingSpinner size="large" />);
    spinnerContainer = container.firstChild as HTMLElement;
    expect(spinnerContainer.className).toMatch(/large/);
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const spinnerContainer = container.firstChild as HTMLElement;
    expect(spinnerContainer.className).toMatch(/custom-class/);
  });

  it('has default size of medium', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerContainer = container.firstChild as HTMLElement;
    expect(spinnerContainer.className).toMatch(/medium/);
  });
});
