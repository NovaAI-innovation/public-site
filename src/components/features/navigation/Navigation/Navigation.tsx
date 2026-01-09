import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useScrollPosition } from '../../../../hooks/useScrollPosition';
import styles from './Navigation.module.css';

/**
 * Navigation component - persistent navigation menu for all pages (FR36)
 * Shows all site routes with active page highlighting (FR42)
 * Fully keyboard accessible (NFR-A1)
 * Sticky navigation with visual feedback on scroll (FR39)
 * Responsive mobile navigation menu (FR40, FR41)
 */
export function Navigation() {
  const isScrolled = useScrollPosition(100); // Show visual feedback after scrolling 100px
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  const navigationItems = [
    { path: '/', label: 'Home' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/favorites', label: 'Favorites' },
    { path: '/services', label: 'Services' },
    { path: '/platforms', label: 'Platforms' },
    { path: '/book', label: 'Book' },
    { path: '/etiquette', label: 'Etiquette' },
    { path: '/about', label: 'About' },
  ];

  // Close mobile menu when route changes (FR41)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        navRef.current &&
        isMobileMenuOpen &&
        !navRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`${styles.navigation} ${isScrolled ? styles.scrolled : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={styles.navContainer}>
        {/* Hamburger button for mobile */}
        <button
          className={styles.hamburger}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`} />
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`} />
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`} />
        </button>

        {/* Desktop navigation */}
        <ul className={styles.navList} role="menubar">
          {navigationItems.map((item) => (
            <li key={item.path} role="none">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                end={item.path === '/'}
                role="menuitem"
                children={({ isActive }) => (
                  <span {...(isActive && { 'aria-current': 'page' })}>
                    {item.label}
                  </span>
                )}
              />
            </li>
          ))}
        </ul>

        {/* Mobile menu overlay and menu */}
        <div
          className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.open : ''}`}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
        <ul
          id="mobile-menu"
          className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}
          role="menubar"
          aria-label="Mobile navigation"
        >
          {navigationItems.map((item) => (
            <li key={item.path} role="none">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${styles.mobileNavLink} ${isActive ? styles.active : ''}`
                }
                end={item.path === '/'}
                role="menuitem"
                onClick={closeMobileMenu} // Close menu on link click (FR41)
                children={({ isActive }) => (
                  <span {...(isActive && { 'aria-current': 'page' })}>
                    {item.label}
                  </span>
                )}
              />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
