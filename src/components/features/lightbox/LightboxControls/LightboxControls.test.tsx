import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LightboxControls } from './LightboxControls';

describe('LightboxControls', () => {
  it('renders previous and next buttons', () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();

    render(
      <LightboxControls
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
      />
    );

    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
  });

  it('calls onPrevious when previous button clicked', () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();

    render(
      <LightboxControls
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
      />
    );

    const previousButton = screen.getByLabelText('Previous image');
    fireEvent.click(previousButton);

    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next button clicked', () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();

    render(
      <LightboxControls
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
      />
    );

    const nextButton = screen.getByLabelText('Next image');
    fireEvent.click(nextButton);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('stops propagation on click to prevent closing lightbox', () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();
    const mockParentClick = vi.fn();

    render(
      <div onClick={mockParentClick}>
        <LightboxControls
          onPrevious={mockOnPrevious}
          onNext={mockOnNext}
        />
      </div>
    );

    const previousButton = screen.getByLabelText('Previous image');
    fireEvent.click(previousButton);

    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('handles keyboard navigation with Enter key', () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();

    render(
      <LightboxControls
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
      />
    );

    const nextButton = screen.getByLabelText('Next image');
    fireEvent.keyDown(nextButton, { key: 'Enter' });

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation with Space key', () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();

    render(
      <LightboxControls
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
      />
    );

    const previousButton = screen.getByLabelText('Previous image');
    fireEvent.keyDown(previousButton, { key: ' ' });

    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('hides previous button when hasPrevious is false and wrapAround is false', () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();

    render(
      <LightboxControls
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={false}
        hasNext={true}
        wrapAround={false}
      />
    );

    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
  });

  it('shows both buttons when wrapAround is true', () => {
    const mockOnPrevious = vi.fn();
    const mockOnNext = vi.fn();

    render(
      <LightboxControls
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        hasPrevious={false}
        hasNext={false}
        wrapAround={true}
      />
    );

    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
  });
});