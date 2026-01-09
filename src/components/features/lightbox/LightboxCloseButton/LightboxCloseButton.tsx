import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import styles from './LightboxCloseButton.module.css';

interface LightboxCloseButtonProps {
  onClose: () => void;
  'aria-label'?: string;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

/**
 * LightboxCloseButton component - close button (X) for lightbox
 * Positioned in top-right corner (FR25)
 */
export const LightboxCloseButton = forwardRef<HTMLButtonElement, LightboxCloseButtonProps>(
  ({ onClose, 'aria-label': ariaLabel = 'Close lightbox', buttonRef }, ref) => {
    const internalRef = React.useRef<HTMLButtonElement>(null);
    
    // Expose ref both ways (forwardRef and buttonRef prop)
    useImperativeHandle(ref, () => internalRef.current as HTMLButtonElement, []);
    useEffect(() => {
      if (buttonRef && internalRef.current) {
        (buttonRef as any).current = internalRef.current;
      }
    }, [buttonRef]);
    
    return (
      <button
        ref={internalRef}
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label={ariaLabel}
        data-testid="lightbox-close-button"
      >
        <span className={styles.icon} aria-hidden="true">
          ×
        </span>
      </button>
    );
  }
);

LightboxCloseButton.displayName = 'LightboxCloseButton';
