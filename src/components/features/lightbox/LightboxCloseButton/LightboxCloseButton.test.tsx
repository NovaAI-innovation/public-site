import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LightboxCloseButton } from './LightboxCloseButton';

describe('LightboxCloseButton', () => {
  it('renders close button with X icon', () => {
    const onClose = vi.fn();
    render(<LightboxCloseButton onClose={onClose} />);
    
    const button = screen.getByTestId('lightbox-close-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Close lightbox');
    
    const icon = button.querySelector('[aria-hidden="true"]');
    expect(icon).toHaveTextContent('×');
  });

  it('calls onClose when clicked', () => {
    const onClose = vi.fn();
    render(<LightboxCloseButton onClose={onClose} />);
    
    const button = screen.getByTestId('lightbox-close-button');
    fireEvent.click(button);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom aria-label when provided', () => {
    const onClose = vi.fn();
    render(<LightboxCloseButton onClose={onClose} aria-label="Close image viewer" />);
    
    const button = screen.getByTestId('lightbox-close-button');
    expect(button).toHaveAttribute('aria-label', 'Close image viewer');
  });

  it('is keyboard accessible', () => {
    const onClose = vi.fn();
    render(<LightboxCloseButton onClose={onClose} />);
    
    const button = screen.getByTestId('lightbox-close-button');
    button.focus();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('type', 'button');
    // Button elements are keyboard accessible by default in browsers
    // Enter and Space keys trigger click automatically
  });
});
