import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSwipe } from './useSwipe';

describe('useSwipe', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns a ref object', () => {
    const { result } = renderHook(() => useSwipe());

    expect(result.current).toHaveProperty('current');
    expect(result.current.current).toBeNull();
  });

  it('accepts swipe callbacks', () => {
    const onSwipeLeft = () => {};
    const onSwipeRight = () => {};
    const onSwipeUp = () => {};
    const onSwipeDown = () => {};

    const { result } = renderHook(() =>
      useSwipe({
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
      })
    );

    expect(result.current).toHaveProperty('current');
  });

  it('accepts custom threshold and velocity', () => {
    const { result } = renderHook(() =>
      useSwipe({
        threshold: 100,
        velocityThreshold: 0.5,
      })
    );

    expect(result.current).toHaveProperty('current');
  });

  it('accepts preventDefault option', () => {
    const { result } = renderHook(() =>
      useSwipe({
        preventDefault: false,
      })
    );

    expect(result.current).toHaveProperty('current');
  });
});
