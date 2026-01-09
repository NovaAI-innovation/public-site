import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollPosition } from './useScrollPosition';

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  // Mock IntersectionObserver as a constructor
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.callback = callback;
      this.options = options;
    }
    callback: IntersectionObserverCallback;
    options?: IntersectionObserverInit;
    observe = mockObserve;
    disconnect = mockDisconnect;
    unobserve = vi.fn();
    root = null;
    rootMargin = '';
    thresholds = [];
  } as any;
  // Clear DOM
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

describe('useScrollPosition', () => {
  it('returns false initially', () => {
    const { result } = renderHook(() => useScrollPosition(100));
    expect(result.current).toBe(false);
  });

  it('creates an Intersection Observer', () => {
    const createSpy = vi.spyOn(global, 'IntersectionObserver');
    renderHook(() => useScrollPosition(100));
    expect(createSpy).toHaveBeenCalled();
    createSpy.mockRestore();
  });

  it('observes a sentinel element', () => {
    renderHook(() => useScrollPosition(100));
    expect(mockObserve).toHaveBeenCalled();
  });

  it('cleans up observer on unmount', () => {
    const { unmount } = renderHook(() => useScrollPosition(100));
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('removes sentinel element on unmount', () => {
    const { unmount } = renderHook(() => useScrollPosition(100));
    // Sentinel should be created
    const sentinels = document.body.querySelectorAll('div[style*="position: absolute"]');
    expect(sentinels.length).toBeGreaterThan(0);
    
    unmount();
    // Sentinel should be removed
    const sentinelsAfter = document.body.querySelectorAll('div[style*="position: absolute"]');
    expect(sentinelsAfter.length).toBe(0);
  });
});
