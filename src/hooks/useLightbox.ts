import { useState, useCallback, useEffect, useRef } from 'react';
import type { GalleryImage } from '../types/gallery';

interface UseLightboxOptions {
  images: GalleryImage[];
  initialIndex?: number;
  onClose?: () => void;
}

interface UseLightboxReturn {
  isOpen: boolean;
  currentImage: GalleryImage | null;
  currentIndex: number;
  open: (image: GalleryImage | number, triggerElement?: HTMLElement | null) => void;
  close: () => void;
  goTo: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  triggerElement: HTMLElement | null;
}

/**
 * useLightbox hook - manages lightbox state and navigation
 * Prevents body scroll when lightbox is open (FR29)
 * Tracks current image index and navigation state
 * Stores trigger element for focus restoration (FR25)
 */
export function useLightbox({ 
  images, 
  initialIndex = 0,
  onClose,
}: UseLightboxOptions): UseLightboxReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Prevent body scroll when lightbox is open (FR29)
  useEffect(() => {
    if (isOpen) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore original overflow on cleanup
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const currentImage = images[currentIndex] || null;
  const hasNext = currentIndex < images.length - 1;
  const hasPrevious = currentIndex > 0;

  const open = useCallback((imageOrIndex: GalleryImage | number, triggerElement?: HTMLElement | null) => {
    // Store trigger element for focus restoration (FR25)
    triggerElementRef.current = triggerElement || null;
    
    // Store current active element as fallback if no trigger provided
    if (!triggerElement && document.activeElement instanceof HTMLElement) {
      triggerElementRef.current = document.activeElement;
    }
    
    if (typeof imageOrIndex === 'number') {
      const index = Math.max(0, Math.min(imageOrIndex, images.length - 1));
      setCurrentIndex(index);
    } else {
      const index = images.findIndex(img => img.id === imageOrIndex.id);
      if (index !== -1) {
        setCurrentIndex(index);
      } else {
        // Image not found, add to images array
        setCurrentIndex(images.length);
      }
    }
    setIsOpen(true);
  }, [images]);

  const close = useCallback(() => {
    setIsOpen(false);
    
    // Restore focus to trigger element (FR25)
    // Use setTimeout to ensure DOM updates are complete
    setTimeout(() => {
      if (triggerElementRef.current && document.contains(triggerElementRef.current)) {
        triggerElementRef.current.focus();
      }
      triggerElementRef.current = null;
    }, 0);
    
    onClose?.();
  }, [onClose]);

  const goTo = useCallback((index: number) => {
    const validIndex = Math.max(0, Math.min(index, images.length - 1));
    setCurrentIndex(validIndex);
  }, [images.length]);

  const goToNext = useCallback(() => {
    if (images.length === 0) return;
    // Wrap around: if at last image, go to first (circular navigation)
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    if (images.length === 0) return;
    // Wrap around: if at first image, go to last (circular navigation)
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  return {
    isOpen,
    currentImage,
    currentIndex,
    open,
    close,
    goTo,
    goToNext,
    goToPrevious,
    hasNext,
    hasPrevious,
    triggerElement: triggerElementRef.current,
  };
}