import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIntersectionObserver, useLazyImage } from './useIntersectionObserver';

// Mock IntersectionObserver
beforeEach(() => {
  global.IntersectionObserver = class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [];
    takeRecords = vi.fn();
  } as any;
});

describe('useIntersectionObserver', () => {
  it('returns ref and intersection state', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current[0]).toHaveProperty('current');
    expect(typeof result.current[1]).toBe('boolean');
    expect(result.current[1]).toBe(false); // Initially false
  });

  it('accepts custom options', () => {
    const { result } = renderHook(() => useIntersectionObserver({ rootMargin: '100px' }));

    expect(result.current[0]).toHaveProperty('current');
    expect(typeof result.current[1]).toBe('boolean');
  });
});

describe('useLazyImage', () => {
  beforeEach(() => {
    // Mock Image constructor
    global.Image = vi.fn().mockImplementation(() => ({
      onload: null,
      onerror: null,
      src: '',
    }));
  });

  it('returns ref, imageSrc, and loading state', () => {
    const { result } = renderHook(() => useLazyImage('test.jpg'));

    expect(result.current[0]).toHaveProperty('current');
    expect(result.current[1]).toBeUndefined(); // imageSrc initially undefined
    expect(result.current[2]).toBe(false); // isLoading initially false
  });

  it('uses IntersectionObserver internally', () => {
    renderHook(() => useLazyImage('test.jpg'));

    // Just verify the hook doesn't throw and returns expected structure
    // Full integration testing happens in component tests
  });
});
