import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FullscreenToggle } from './FullscreenToggle';

describe('FullscreenToggle', () => {
  it('renders when fullscreen is not active', () => {
    const onToggle = vi.fn();
    render(<FullscreenToggle isFullscreen={false} onToggle={onToggle} />);
    
    const button = screen.getByTestId('fullscreen-toggle');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Enter fullscreen mode');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders when fullscreen is active', () => {
    const onToggle = vi.fn();
    render(<FullscreenToggle isFullscreen={true} onToggle={onToggle} />);
    
    const button = screen.getByTestId('fullscreen-toggle');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Exit fullscreen mode');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<FullscreenToggle isFullscreen={false} onToggle={onToggle} />);
    
    const button = screen.getByTestId('fullscreen-toggle');
    fireEvent.click(button);
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not render when fullscreen is not supported', () => {
    const onToggle = vi.fn();
    render(<FullscreenToggle isFullscreen={false} onToggle={onToggle} isSupported={false} />);
    
    const button = screen.queryByTestId('fullscreen-toggle');
    expect(button).not.toBeInTheDocument();
  });

  it('uses custom aria-label when provided', () => {
    const onToggle = vi.fn();
    render(
      <FullscreenToggle 
        isFullscreen={false} 
        onToggle={onToggle} 
        aria-label="Toggle fullscreen"
      />
    );
    
    const button = screen.getByTestId('fullscreen-toggle');
    expect(button).toHaveAttribute('aria-label', 'Toggle fullscreen');
  });

  it('displays exit icon when in fullscreen mode', () => {
    const onToggle = vi.fn();
    render(<FullscreenToggle isFullscreen={true} onToggle={onToggle} />);
    
    const button = screen.getByTestId('fullscreen-toggle');
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
    // Exit icon should have a path with "M3 16h3a2"
    expect(icon?.innerHTML).toContain('M8 3v3a2');
  });

  it('displays enter icon when not in fullscreen mode', () => {
    const onToggle = vi.fn();
    render(<FullscreenToggle isFullscreen={false} onToggle={onToggle} />);
    
    const button = screen.getByTestId('fullscreen-toggle');
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
    // Enter icon should have a path with "M8 3H5a2"
    expect(icon?.innerHTML).toContain('M8 3H5a2');
  });

  it('is keyboard accessible', () => {
    const onToggle = vi.fn();
    render(<FullscreenToggle isFullscreen={false} onToggle={onToggle} />);
    
    const button = screen.getByTestId('fullscreen-toggle');
    button.focus();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('type', 'button');
    // Button elements are keyboard accessible by default in browsers
    // Enter and Space keys trigger click automatically
  });
});
