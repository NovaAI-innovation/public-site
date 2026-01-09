import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {}
  observe() {}
  disconnect() {}
  unobserve() {}
  root = null;
  rootMargin = '';
  thresholds = [];
} as any;