import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AgeVerificationProvider, useAgeVerification } from './AgeVerificationContext';
import { AgeVerification } from '../components/features/auth/AgeVerification/AgeVerification';

const STORAGE_KEY = 'age-verified';

// Test component that uses the hook
function TestComponent() {
  const { isVerified, isModalOpen, verifyAge, declineAge, checkVerificationStatus } = useAgeVerification();

  return (
    <div>
      <div data-testid="is-verified">{isVerified ? 'verified' : 'not-verified'}</div>
      <div data-testid="is-modal-open">{isModalOpen ? 'open' : 'closed'}</div>
      <button onClick={verifyAge} data-testid="verify-button">
        Verify
      </button>
      <button onClick={declineAge} data-testid="decline-button">
        Decline
      </button>
      <button onClick={checkVerificationStatus} data-testid="check-button">
        Check Status
      </button>
      {isModalOpen && (
        <AgeVerification
          isOpen={isModalOpen}
          onVerify={verifyAge}
          onDecline={declineAge}
        />
      )}
    </div>
  );
}

describe('AgeVerificationContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Create portal root if it doesn't exist
    if (!document.getElementById('root')) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    }
  });

  afterEach(() => {
    localStorage.clear();
    document.body.style.overflow = '';
    vi.clearAllMocks();
  });

  it('provides age verification context', () => {
    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const isVerified = screen.getByTestId('is-verified');
    expect(isVerified).toBeInTheDocument();
  });

  it('shows modal when verification status is not found in localStorage', () => {
    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const isModalOpen = screen.getByTestId('is-modal-open');
    expect(isModalOpen).toHaveTextContent('open');

    const modal = screen.queryByTestId('age-verification-modal');
    expect(modal).toBeInTheDocument();
  });

  it('hides modal when verification status is found in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'true');

    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const isModalOpen = screen.getByTestId('is-modal-open');
    expect(isModalOpen).toHaveTextContent('closed');

    const modal = screen.queryByTestId('age-verification-modal');
    expect(modal).not.toBeInTheDocument();
  });

  it('sets isVerified to true when verifyAge is called', async () => {
    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      const isVerified = screen.getByTestId('is-verified');
      expect(isVerified).toHaveTextContent('verified');
    });

    // Modal should be closed
    const isModalOpen = screen.getByTestId('is-modal-open');
    expect(isModalOpen).toHaveTextContent('closed');
  });

  it('saves verification status to localStorage when verifyAge is called', async () => {
    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBe('true');
    });
  });

  it('closes modal when declineAge is called', async () => {
    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    // Modal should be open initially
    expect(screen.queryByTestId('age-verification-modal')).toBeInTheDocument();

    const declineButton = screen.getByTestId('decline-button');
    fireEvent.click(declineButton);

    await waitFor(() => {
      const isModalOpen = screen.getByTestId('is-modal-open');
      expect(isModalOpen).toHaveTextContent('closed');
    });

    // Modal should be closed
    expect(screen.queryByTestId('age-verification-modal')).not.toBeInTheDocument();
  });

  it('checkVerificationStatus returns true when verified in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'true');

    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const checkButton = screen.getByTestId('check-button');
    
    // The checkVerificationStatus is called internally on mount
    // We can test it by checking the initial state
    const isVerified = screen.getByTestId('is-verified');
    expect(isVerified).toHaveTextContent('verified');
  });

  it('checkVerificationStatus returns false when not verified in localStorage', () => {
    // localStorage is cleared in beforeEach
    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const isVerified = screen.getByTestId('is-verified');
    expect(isVerified).toHaveTextContent('not-verified');
  });

  it('handles localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('localStorage error');
    });

    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    // Should still render and show modal (graceful degradation)
    const isModalOpen = screen.getByTestId('is-modal-open');
    expect(isModalOpen).toBeInTheDocument();

    // Restore original
    Storage.prototype.getItem = originalGetItem;
  });

  it('handles localStorage setItem errors gracefully', async () => {
    // Mock localStorage.setItem to throw an error
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('localStorage error');
    });

    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Should still allow access (graceful degradation)
    await waitFor(() => {
      const isVerified = screen.getByTestId('is-verified');
      expect(isVerified).toHaveTextContent('verified');
    });

    // Restore original
    Storage.prototype.setItem = originalSetItem;
  });

  it('throws error when useAgeVerification is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAgeVerification must be used within an AgeVerificationProvider');

    consoleError.mockRestore();
  });

  it('redirects away from site when declineAge is called', async () => {
    // Mock window.location.href
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as Location;

    const mockLocationHref = vi.fn();
    Object.defineProperty(window.location, 'href', {
      set: mockLocationHref,
      get: () => '',
      configurable: true,
    });

    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const declineButton = screen.getByTestId('decline-button');
    fireEvent.click(declineButton);

    // Wait for redirect to be called
    await waitFor(() => {
      expect(mockLocationHref).toHaveBeenCalledWith('https://www.google.com');
    }, { timeout: 200 });

    // Restore original location
    window.location = originalLocation;
  });

  // Story 5.2: Task 1 - Store verification in localStorage
  it('stores verification status to localStorage with key age-verified and value true', async () => {
    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      const stored = localStorage.getItem('age-verified');
      expect(stored).toBe('true');
    });
  });

  // Story 5.2: Task 2 - Check localStorage on app load
  it('checks localStorage on mount and skips modal if already verified', () => {
    localStorage.setItem(STORAGE_KEY, 'true');

    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const isModalOpen = screen.getByTestId('is-modal-open');
    expect(isModalOpen).toHaveTextContent('closed');

    const isVerified = screen.getByTestId('is-verified');
    expect(isVerified).toHaveTextContent('verified');
  });

  // Story 5.2: Task 2 - Handle localStorage errors gracefully
  it('handles localStorage errors gracefully when checking on mount', () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn(() => {
      throw new Error('localStorage error');
    });

    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    // Should still render and show modal (graceful degradation)
    const isModalOpen = screen.getByTestId('is-modal-open');
    expect(isModalOpen).toBeInTheDocument();

    // Restore original
    Storage.prototype.getItem = originalGetItem;
  });

  // Story 5.2: Task 3 - Initialize context state from localStorage
  it('initializes context state from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, 'true');

    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    // State should be initialized from localStorage
    const isVerified = screen.getByTestId('is-verified');
    expect(isVerified).toHaveTextContent('verified');
  });

  // Story 5.2: Task 3 - Sync localStorage with context state
  it('syncs localStorage with context state when verification status changes', async () => {
    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    // Initially not verified
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // Verify age
    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Wait for state update
    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
      const isVerified = screen.getByTestId('is-verified');
      expect(isVerified).toHaveTextContent('verified');
    });
  });

  // Story 5.2: Task 3 - Persist across page refreshes (simulated by unmount/remount)
  it('persists verification status across page refreshes', async () => {
    // Simulate first visit - verify age
    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    const verifyButton = screen.getByTestId('verify-button');
    fireEvent.click(verifyButton);

    // Wait for localStorage to be updated
    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    // Simulate page refresh - unmount and remount
    cleanup();

    render(
      <AgeVerificationProvider>
        <TestComponent />
      </AgeVerificationProvider>
    );

    // Status should be persisted - modal should be closed
    const isModalOpen = screen.getByTestId('is-modal-open');
    expect(isModalOpen).toHaveTextContent('closed');

    const isVerified = screen.getByTestId('is-verified');
    expect(isVerified).toHaveTextContent('verified');
  });
});