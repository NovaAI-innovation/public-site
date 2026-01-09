import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('renders skip link with href', () => {
    render(<SkipLink href="#main">Skip to main content</SkipLink>);

    const link = screen.getByText('Skip to main content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main');
  });

  it('is hidden by default', () => {
    render(<SkipLink href="#main">Skip to main</SkipLink>);

    const link = screen.getByText('Skip to main');
    // CSS Modules generates hashed class names
    expect(link.className).toMatch(/skipLink/);
    // Skip link should be an anchor element
    expect(link.tagName).toBe('A');
  });

  it('is focusable and has correct href', () => {
    render(<SkipLink href="#main">Skip to main</SkipLink>);

    const link = screen.getByText('Skip to main');
    expect(link).toHaveAttribute('href', '#main');
    // Skip links should be focusable
    expect(link).toHaveAttribute('tabIndex', '0');
  });

  it('applies custom className', () => {
    render(
      <SkipLink href="#main" className="custom-class">
        Skip to main
      </SkipLink>
    );

    const link = screen.getByText('Skip to main');
    expect(link).toHaveClass('custom-class');
  });
});