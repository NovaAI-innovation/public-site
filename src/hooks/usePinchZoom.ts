import { useRef, useCallback, useEffect, useState } from 'react';

interface PinchZoomOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  onScaleChange?: (scale: number) => void;
}

interface PinchState {
  initialDistance: number;
  initialScale: number;
  touches: [Touch, Touch] | null;
}

/**
 * usePinchZoom hook - detects pinch-to-zoom gestures on touch devices
 * Returns scale state and ref to attach to element
 * Optimized for performance with passive listeners and minimal calculations
 */
export function usePinchZoom({
  minScale = 1,
  maxScale = 5,
  initialScale = 1,
  onScaleChange,
}: PinchZoomOptions = {}) {
  const elementRef = useRef<HTMLElement | null>(null);
  const pinchStateRef = useRef<PinchState | null>(null);
  const [scale, setScale] = useState(initialScale);

  // Calculate distance between two touches
  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const updateScale = useCallback((newScale: number) => {
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));
    setScale(clampedScale);
    onScaleChange?.(clampedScale);
  }, [minScale, maxScale, onScaleChange]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger touch detected - start pinch gesture
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      if (touch1 && touch2) {
        const distance = getDistance(touch1, touch2);
        // Use current scale from state via callback
        setScale(currentScale => {
          pinchStateRef.current = {
            initialDistance: distance,
            initialScale: currentScale,
            touches: [touch1, touch2],
          };
          return currentScale; // Don't change scale on touch start
        });
        e.preventDefault(); // Prevent scrolling during pinch
      }
    } else {
      // Reset pinch state if not two touches
      pinchStateRef.current = null;
    }
  }, [getDistance]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pinchStateRef.current || e.touches.length !== 2) {
      return;
    }

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    if (!touch1 || !touch2) {
      return;
    }

    const currentDistance = getDistance(touch1, touch2);
    const state = pinchStateRef.current;
    
    if (!state) return;
    
    const { initialDistance, initialScale } = state;
    
    // Calculate scale based on distance change
    const scaleChange = currentDistance / initialDistance;
    const newScale = initialScale * scaleChange;
    
    updateScale(newScale);
    e.preventDefault(); // Prevent scrolling during pinch
  }, [getDistance, updateScale]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Reset pinch state when touch ends
    if (e.touches.length < 2) {
      pinchStateRef.current = null;
    }
  }, []);

  // Reset scale when reset is needed
  const reset = useCallback(() => {
    updateScale(initialScale);
  }, [initialScale, updateScale]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Use non-passive listeners to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    elementRef,
    scale,
    reset,
  };
}
