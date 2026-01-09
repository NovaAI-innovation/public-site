import React from 'react';
import styles from './SkipLink.module.css';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * SkipLink component - provides keyboard navigation shortcuts
 * Visible on focus, hidden by default (for screen readers and keyboard users)
 */
export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`${styles.skipLink} ${className || ''}`}
      tabIndex={0}
    >
      {children}
    </a>
  );
}