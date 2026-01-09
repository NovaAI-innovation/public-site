import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ImageHoverOverlay } from './ImageHoverOverlay';

describe('ImageHoverOverlay', () => {
  it('renders overlay with eye icon', () => {
    render(<ImageHoverOverlay />);

    const overlay = screen.getByText('View').closest('div[class*="overlay"]');
    expect(overlay).toBeInTheDocument();
  });

  it('displays "View" label', () => {
    render(<ImageHoverOverlay />);

    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('has eye icon SVG', () => {
    render(<ImageHoverOverlay />);

    const svg = screen.getByText('View').parentElement?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ImageHoverOverlay className="custom-class" />);

    const overlay = screen.getByText('View').closest('div[class*="overlay"]');
    expect(overlay).toHaveClass('custom-class');
  });

  it('has aria-hidden on icon', () => {
    render(<ImageHoverOverlay />);

    const icon = screen.getByText('View').parentElement?.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });
});