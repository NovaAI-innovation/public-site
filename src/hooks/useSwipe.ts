import { useRef, useCallback, useEffect } from 'react';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels to trigger swipe
  velocityThreshold?: number; // Minimum velocity to trigger swipe
  preventDefault?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
}

/**
 * useSwipe hook - detects swipe gestures on touch devices
 * Returns ref to attach to element and handlers for swipe callbacks
 * Optimized for performance with passive listeners and minimal calculations
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50, // Default 50px minimum swipe distance
  velocityThreshold = 0.3, // Default 0.3 px/ms minimum velocity
  preventDefault = true,
}: SwipeOptions = {}) {
  const elementRef = useRef<HTMLElement | null>(null);
  const touchStateRef = useRef<TouchState | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
    };

    if (preventDefault) {
      e.preventDefault();
    }
  }, [preventDefault]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStateRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    touchStateRef.current.currentX = touch.clientX;
    touchStateRef.current.currentY = touch.clientY;

    if (preventDefault) {
      e.preventDefault();
    }
  }, [preventDefault]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStateRef.current) return;

    const { startX, startY, startTime, currentX, currentY } = touchStateRef.current;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const deltaTime = Date.now() - startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Check if swipe meets threshold requirements
    if (distance < threshold || velocity < velocityThreshold) {
      touchStateRef.current = null;
      return;
    }

    // Determine swipe direction (prioritize horizontal over vertical)
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    touchStateRef.current = null;
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Use passive listeners for better performance (except preventDefault)
    const passiveOptions = preventDefault ? false : { passive: true };

    element.addEventListener('touchstart', handleTouchStart, passiveOptions);
    element.addEventListener('touchmove', handleTouchMove, passiveOptions);
    element.addEventListener('touchend', handleTouchEnd, passiveOptions);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  return elementRef;
}