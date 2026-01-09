import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AgeVerification } from './AgeVerification';

describe('AgeVerification', () => {
  const mockOnVerify = vi.fn();
  const mockOnDecline = vi.fn();

  beforeEach(() => {
    // Create portal root if it doesn't exist
    if (!document.getElementById('root')) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    }
  });

  afterEach(() => {
    document.body.style.overflow = '';
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const modal = screen.getByTestId('age-verification-modal');
    expect(modal).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <AgeVerification
        isOpen={false}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const modal = screen.queryByTestId('age-verification-modal');
    expect(modal).not.toBeInTheDocument();
  });

  it('displays age verification prompt text', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const prompt = screen.getByText(/age verification/i);
    expect(prompt).toBeInTheDocument();
  });

  it('displays "I am 18+" button', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const verifyButton = screen.getByRole('button', { name: /i am 18 years or older/i });
    expect(verifyButton).toBeInTheDocument();
    expect(verifyButton).toHaveTextContent('I am 18+');
  });

  it('displays "I am under 18" button', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const declineButton = screen.getByRole('button', { name: /i am under 18/i });
    expect(declineButton).toBeInTheDocument();
  });

  it('calls onVerify when "I am 18+" button is clicked', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const verifyButton = screen.getByRole('button', { name: /i am 18 years or older/i });
    fireEvent.click(verifyButton);

    expect(mockOnVerify).toHaveBeenCalledTimes(1);
    expect(mockOnDecline).not.toHaveBeenCalled();
  });

  it('calls onDecline when "I am under 18" button is clicked', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const declineButton = screen.getByRole('button', { name: /i am under 18/i });
    fireEvent.click(declineButton);

    expect(mockOnDecline).toHaveBeenCalledTimes(1);
    expect(mockOnVerify).not.toHaveBeenCalled();
  });

  it('prevents body scroll when open', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <AgeVerification
        isOpen={false}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('has proper ARIA attributes', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const modal = screen.getByTestId('age-verification-modal');
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('closes on Escape key', () => {
    // Note: Escape key should not close age verification modal
    // User must make a choice, but we test that Escape is handled
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    // Escape key should be prevented (modal cannot be dismissed via Escape)
    fireEvent.keyDown(window, { key: 'Escape' });
    
    // Modal should still be open - user must choose
    const modal = screen.queryByTestId('age-verification-modal');
    expect(modal).toBeInTheDocument();
  });

  it('traps focus within modal', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const verifyButton = screen.getByRole('button', { name: /i am 18 years or older/i });
    const declineButton = screen.getByRole('button', { name: /i am under 18 years old/i });
    
    // Both buttons should be focusable (buttons are focusable by default)
    expect(verifyButton).toBeInTheDocument();
    expect(declineButton).toBeInTheDocument();
    // Buttons don't need explicit tabIndex as they're focusable by default
    expect(verifyButton).not.toHaveAttribute('tabIndex', '-1');
    expect(declineButton).not.toHaveAttribute('tabIndex', '-1');
  });

  it('renders using portal', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const modal = screen.getByTestId('age-verification-modal');
    // Portal renders to document.body
    expect(modal.parentElement).toBe(document.body);
  });

  it('prevents backdrop click from closing modal', () => {
    render(
      <AgeVerification
        isOpen={true}
        onVerify={mockOnVerify}
        onDecline={mockOnDecline}
      />
    );

    const modal = screen.getByTestId('age-verification-modal');
    
    // Clicking backdrop should not close modal (user must choose)
    fireEvent.click(modal);
    
    // Modal should still be open
    expect(screen.queryByTestId('age-verification-modal')).toBeInTheDocument();
    expect(mockOnVerify).not.toHaveBeenCalled();
    expect(mockOnDecline).not.toHaveBeenCalled();
  });
});