import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFullscreen } from './useFullscreen';

describe('useFullscreen', () => {
  beforeEach(() => {
    // Mock fullscreen API
    (document as any).fullscreenElement = null;
    (document as any).fullscreenEnabled = true;
    (document.documentElement as any).requestFullscreen = vi.fn(() => Promise.resolve());
    (document as any).exitFullscreen = vi.fn(() => Promise.resolve());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with fullscreen state as false', () => {
    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isFullscreen).toBe(false);
  });

  it('checks if fullscreen is supported', () => {
    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isSupported).toBe(true);
  });

  it('reports not supported when fullscreen API is unavailable', () => {
    delete (document as any).fullscreenEnabled;
    delete (document as any).webkitFullscreenEnabled;
    delete (document as any).mozFullScreenEnabled;
    delete (document as any).msFullscreenEnabled;

    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isSupported).toBe(false);
  });

  it('toggles fullscreen on/off', async () => {
    const { result } = renderHook(() => useFullscreen());

    // Enter fullscreen
    await act(async () => {
      (document as any).fullscreenElement = document.documentElement;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(true);

    // Exit fullscreen
    await act(async () => {
      (document as any).fullscreenElement = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(false);
  });

  it('calls requestFullscreen when entering fullscreen', async () => {
    const { result } = renderHook(() => useFullscreen());
    const requestFullscreenMock = vi.fn(() => Promise.resolve());
    (document.documentElement as any).requestFullscreen = requestFullscreenMock;

    await act(async () => {
      await result.current.toggleFullscreen();
    });

    expect(requestFullscreenMock).toHaveBeenCalledTimes(1);
  });

  it('calls exitFullscreen when exiting fullscreen', async () => {
    const { result } = renderHook(() => useFullscreen());
    const exitFullscreenMock = vi.fn(() => Promise.resolve());
    (document as any).exitFullscreen = exitFullscreenMock;

    // Set fullscreen state first
    await act(async () => {
      (document as any).fullscreenElement = document.documentElement;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(true);

    // Exit fullscreen
    await act(async () => {
      await result.current.toggleFullscreen();
    });

    expect(exitFullscreenMock).toHaveBeenCalledTimes(1);
  });

  it('handles fullscreen change events', async () => {
    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isFullscreen).toBe(false);

    await act(async () => {
      (document as any).fullscreenElement = document.documentElement;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current.isFullscreen).toBe(true);
  });

  it('handles errors gracefully', async () => {
    const { result } = renderHook(() => useFullscreen());
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (document.documentElement as any).requestFullscreen = vi.fn(() => 
      Promise.reject(new Error('Fullscreen failed'))
    );

    await act(async () => {
      await result.current.toggleFullscreen();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('cleans up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useFullscreen());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('webkitfullscreenchange', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mozfullscreenchange', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('MSFullscreenChange', expect.any(Function));
  });
});
