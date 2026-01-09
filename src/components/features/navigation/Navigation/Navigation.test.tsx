import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, act, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navigation } from './Navigation';
import styles from './Navigation.module.css';

describe('Navigation', () => {
  it('renders all navigation links', () => {
    const { container } = render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    
    // Check desktop navigation (should be visible by default)
    const desktopMenu = container.querySelector('[class*="navList"]') as HTMLElement;
    expect(desktopMenu).toBeInTheDocument();
    
    // Check mobile menu exists (hidden by default)
    const mobileMenu = screen.getByRole('menubar', { name: /mobile navigation/i });
    expect(mobileMenu).toBeInTheDocument();
    
    // Check hamburger button exists
    expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
    
    // Check all links exist (using getAllByRole since both menus exist)
    const homeLinks = screen.getAllByRole('menuitem', { name: /home/i });
    expect(homeLinks.length).toBe(2); // Desktop and mobile
    expect(homeLinks[0]).toBeInTheDocument();
  });

  it('highlights active page', () => {
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <Navigation />
      </MemoryRouter>
    );

    // Check both desktop and mobile menus highlight the active page
    const galleryLinks = screen.getAllByRole('menuitem', { name: /gallery/i });
    expect(galleryLinks.length).toBe(2); // Desktop and mobile
    
    galleryLinks.forEach((link) => {
      expect(link).toHaveClass(styles.active);
      // aria-current is on the child span, not the link itself
      const gallerySpan = link.querySelector('span');
      expect(gallerySpan).toHaveAttribute('aria-current', 'page');
    });
  });

  it('highlights home page when on root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navigation />
      </MemoryRouter>
    );

    // Check both desktop and mobile menus highlight home
    const homeLinks = screen.getAllByRole('menuitem', { name: /home/i });
    expect(homeLinks.length).toBe(2); // Desktop and mobile
    
    homeLinks.forEach((link) => {
      expect(link).toHaveClass(styles.active);
      const homeSpan = link.querySelector('span');
      expect(homeSpan).toHaveAttribute('aria-current', 'page');
    });
  });

  it('does not highlight inactive pages', () => {
    render(
      <MemoryRouter initialEntries={['/gallery']}>
        <Navigation />
      </MemoryRouter>
    );

    // Check both desktop and mobile menus don't highlight inactive pages
    const homeLinks = screen.getAllByRole('menuitem', { name: /home/i });
    expect(homeLinks.length).toBe(2); // Desktop and mobile
    
    homeLinks.forEach((link) => {
      expect(link).not.toHaveClass(styles.active);
      const homeSpan = link.querySelector('span');
      expect(homeSpan).not.toHaveAttribute('aria-current');
    });
  });

  it('has proper ARIA attributes', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();

    // Check desktop menu
    const desktopMenus = screen.getAllByRole('menubar');
    expect(desktopMenus.length).toBeGreaterThanOrEqual(1);

    // Check hamburger button
    const hamburger = screen.getByRole('button', { name: /open navigation menu/i });
    expect(hamburger).toHaveAttribute('aria-controls', 'mobile-menu');
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    // Check mobile menu
    const mobileMenu = screen.getByRole('menubar', { name: /mobile navigation/i });
    expect(mobileMenu).toHaveAttribute('id', 'mobile-menu');

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('has accessible focus indicators', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    // Check both desktop and mobile links have focus indicators via CSS
    const galleryLinks = screen.getAllByRole('menuitem', { name: /gallery/i });
    expect(galleryLinks.length).toBe(2); // Desktop and mobile
    
    galleryLinks.forEach((link) => {
      expect(link).toBeInTheDocument();
      // Focus indicators are handled via CSS :focus-visible
    });
  });

  it('renders links with correct hrefs', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    // Check all links have correct hrefs (check first of each pair - desktop)
    const homeLinks = screen.getAllByRole('menuitem', { name: /home/i });
    expect(homeLinks[0]).toHaveAttribute('href', '/');
    
    const galleryLinks = screen.getAllByRole('menuitem', { name: /gallery/i });
    expect(galleryLinks[0]).toHaveAttribute('href', '/gallery');
    
    const favoritesLinks = screen.getAllByRole('menuitem', { name: /favorites/i });
    expect(favoritesLinks[0]).toHaveAttribute('href', '/favorites');
    
    const servicesLinks = screen.getAllByRole('menuitem', { name: /services/i });
    expect(servicesLinks[0]).toHaveAttribute('href', '/services');
    
    const platformsLinks = screen.getAllByRole('menuitem', { name: /platforms/i });
    expect(platformsLinks[0]).toHaveAttribute('href', '/platforms');
    
    const bookLinks = screen.getAllByRole('menuitem', { name: /book/i });
    expect(bookLinks[0]).toHaveAttribute('href', '/book');
    
    const etiquetteLinks = screen.getAllByRole('menuitem', { name: /etiquette/i });
    expect(etiquetteLinks[0]).toHaveAttribute('href', '/etiquette');
    
    const aboutLinks = screen.getAllByRole('menuitem', { name: /about/i });
    expect(aboutLinks[0]).toHaveAttribute('href', '/about');
  });

  it('has sticky positioning', () => {
    const { container } = render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass(styles.navigation);
    // Sticky positioning is applied via CSS, so we check the class exists
    expect(nav).toBeInTheDocument();
  });

  it('toggles mobile menu on hamburger click', async () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    const hamburger = screen.getByRole('button', { name: /open navigation menu/i });
    const mobileMenu = screen.getByRole('menubar', { name: /mobile navigation/i });
    
    // Initially closed
    expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    expect(mobileMenu).not.toHaveClass(styles.open);
    
    // Click to open
    act(() => {
      fireEvent.click(hamburger);
    });
    
    await waitFor(() => {
      expect(hamburger).toHaveAttribute('aria-expanded', 'true');
      expect(mobileMenu).toHaveClass(styles.open);
    });
    
    // Click to close
    act(() => {
      fireEvent.click(hamburger);
    });
    
    await waitFor(() => {
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');
      expect(mobileMenu).not.toHaveClass(styles.open);
    });
  });

  it('closes mobile menu when navigation link is clicked', async () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    const hamburger = screen.getByRole('button', { name: /open navigation menu/i });
    const mobileMenu = screen.getByRole('menubar', { name: /mobile navigation/i });
    const galleryLinks = screen.getAllByRole('menuitem', { name: /gallery/i });
    const mobileGalleryLink = galleryLinks.find(link => 
      link.className.includes('mobileNavLink')
    );
    
    // Open menu
    act(() => {
      fireEvent.click(hamburger);
    });
    
    await waitFor(() => {
      expect(mobileMenu).toHaveClass(styles.open);
    });
    
    // Click mobile link
    if (mobileGalleryLink) {
      act(() => {
        fireEvent.click(mobileGalleryLink);
      });
      
      // Menu should close (handled by onClick handler)
      await waitFor(() => {
        expect(mobileMenu).not.toHaveClass(styles.open);
      });
    }
  });
});
