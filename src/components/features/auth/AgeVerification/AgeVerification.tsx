import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import styles from './AgeVerification.module.css';

interface AgeVerificationProps {
  isOpen: boolean;
  onVerify: () => void;
  onDecline: () => void;
}

/**
 * AgeVerification component - modal for age verification
 * Displays modal requiring user to confirm age before accessing site (FR47)
 * Prevents access until user makes a choice (FR50)
 * Modal cannot be dismissed via Escape or backdrop click - user must choose
 */
export function AgeVerification({
  isOpen,
  onVerify,
  onDecline,
}: AgeVerificationProps) {
  const modalContainerRef = useRef<HTMLDivElement>(null);
  
  // Focus trap for accessibility (AC: #1)
  const focusTrapRef = useFocusTrap({
    enabled: isOpen,
    initialFocus: null, // Will focus first button
    returnFocus: false, // Don't return focus when closed
  });

  // Connect focus trap ref to modal container
  useEffect(() => {
    if (modalContainerRef.current) {
      (focusTrapRef as any).current = modalContainerRef.current;
    }
  }, [focusTrapRef, isOpen]);

  // Focus first button when modal opens
  const verifyButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isOpen && verifyButtonRef.current) {
      verifyButtonRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when open (AC: #1)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Handle keyboard navigation - prevent Escape from closing
  // User must make a choice (AC: #1)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Escape key from closing modal
      // User must choose "I am 18+" or "I am under 18"
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // Render using portal to ensure proper z-index and focus management
  return createPortal(
    <div
      ref={modalContainerRef}
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-verification-title"
      aria-describedby="age-verification-description"
      tabIndex={-1}
      data-testid="age-verification-modal"
    >
      <div className={styles.overlay} aria-hidden="true" />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 id="age-verification-title" className={styles.title}>
            Age Verification
          </h2>
          <p id="age-verification-description" className={styles.description}>
            You must be 18 years or older to access this site. Please confirm your age.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            ref={verifyButtonRef}
            type="button"
            onClick={onVerify}
            className={styles.verifyButton}
            aria-label="I am 18 years or older"
          >
            I am 18+
          </button>
          <button
            type="button"
            onClick={onDecline}
            className={styles.declineButton}
            aria-label="I am under 18 years old"
          >
            I am under 18
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}