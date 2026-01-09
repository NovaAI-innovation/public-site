import { useEffect, useRef, RefObject } from 'react';

interface FocusTrapOptions {
  enabled?: boolean;
  initialFocus?: RefObject<HTMLElement>;
  returnFocus?: boolean;
  returnFocusElement?: HTMLElement | null;
}

/**
 * useFocusTrap hook - traps focus within a container element
 * Prevents focus from escaping the container when Tab/Shift+Tab is pressed
 * Returns ref to attach to container element
 */
export function useFocusTrap({
  enabled = true,
  initialFocus,
  returnFocus = true,
  returnFocusElement = null,
}: FocusTrapOptions = {}): RefObject<HTMLElement> {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element before trap is activated
  useEffect(() => {
    if (enabled) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      
      // Focus initial element or container
      const timer = setTimeout(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus();
        } else if (containerRef.current) {
          containerRef.current.focus();
        }
      }, 0);

      return () => {
        clearTimeout(timer);
        
        // Return focus to previous element when trap is deactivated
        if (returnFocus && previousActiveElementRef.current) {
          // Check if element is still in DOM
          if (document.contains(previousActiveElementRef.current)) {
            previousActiveElementRef.current.focus();
          } else if (returnFocusElement && document.contains(returnFocusElement)) {
            returnFocusElement.focus();
          }
        }
      };
    }
  }, [enabled, initialFocus, returnFocus, returnFocusElement]);

  // Trap focus within container
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Tab key
      if (e.key !== 'Tab') return;

      // Get all focusable elements within container
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => {
        // Filter out hidden elements
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If Shift+Tab and focus is on first element, move to last
      if (e.shiftKey) {
        if (document.activeElement === firstElement || document.activeElement === container) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // If Tab and focus is on last element, move to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  return containerRef;
}
