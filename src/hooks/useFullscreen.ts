import { useState, useEffect, useCallback } from 'react';

/**
 * useFullscreen hook - manages fullscreen state using the Fullscreen API
 * Handles browser differences and vendor prefixes
 * Provides toggle functionality and state management
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get fullscreen element and API methods with vendor prefixes
  const getFullscreenElement = useCallback(() => {
    return (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement ||
      null
    );
  }, []);

  const requestFullscreen = useCallback(() => {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      return (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      return (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      return (element as any).msRequestFullscreen();
    }
    
    return Promise.reject(new Error('Fullscreen API is not supported'));
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      return (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      return (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      return (document as any).msExitFullscreen();
    }
    
    return Promise.reject(new Error('Fullscreen API is not supported'));
  }, []);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = getFullscreenElement();
      setIsFullscreen(!!fullscreenElement);
    };

    // Listen to all vendor-prefixed fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Check initial state
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [getFullscreenElement]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (isFullscreen) {
        await exitFullscreen();
      } else {
        await requestFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      // Silently fail - fullscreen may not be supported
    }
  }, [isFullscreen, requestFullscreen, exitFullscreen]);

  // Check if fullscreen is supported
  const isSupported = useCallback(() => {
    return !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    );
  }, []);

  return {
    isFullscreen,
    toggleFullscreen,
    requestFullscreen,
    exitFullscreen,
    isSupported: isSupported(),
  };
}
