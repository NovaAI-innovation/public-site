import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInfiniteScroll } from './useInfiniteScroll';

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

describe('useInfiniteScroll', () => {
  it('returns a ref object', () => {
    const mockOnLoadMore = vi.fn();
    const { result } = renderHook(() =>
      useInfiniteScroll(mockOnLoadMore, true, false)
    );

    expect(result.current).toHaveProperty('current');
    expect(result.current.current).toBeNull();
  });

  it('accepts custom threshold', () => {
    const mockOnLoadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(mockOnLoadMore, true, false, 300));

    expect(result.current).toHaveProperty('current');
  });

  it('works with hasNextPage true', () => {
    const mockOnLoadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(mockOnLoadMore, true, false));

    expect(result.current).toHaveProperty('current');
  });

  it('works with hasNextPage false', () => {
    const mockOnLoadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(mockOnLoadMore, false, false));

    expect(result.current).toHaveProperty('current');
  });

  it('works when loading', () => {
    const mockOnLoadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(mockOnLoadMore, true, true));

    expect(result.current).toHaveProperty('current');
  });
});
