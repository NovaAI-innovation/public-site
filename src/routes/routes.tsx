import React from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load all pages for code splitting (NFR-P28: < 50KB per chunk)
const HomePage = React.lazy(() => import('../pages/HomePage/HomePage'));
const GalleryPage = React.lazy(() => import('../pages/Gallery/Gallery'));
const FavoritesPage = React.lazy(() => import('../pages/FavoritesPage/FavoritesPage'));
const ServicesPage = React.lazy(() => import('../pages/ServicesPage/ServicesPage'));
const PlatformsPage = React.lazy(() => import('../pages/PlatformsPage/PlatformsPage'));
const BookingPage = React.lazy(() => import('../pages/BookingPage/BookingPage'));
const EtiquettePage = React.lazy(() => import('../pages/EtiquettePage/EtiquettePage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage/AboutPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage/NotFoundPage'));

// Export named exports for direct imports if needed
export { HomePage, GalleryPage, FavoritesPage, ServicesPage, PlatformsPage, BookingPage, EtiquettePage, AboutPage, NotFoundPage };

/**
 * Route configuration for the public-site application
 * All routes are lazy loaded for code splitting (FR35, NFR-P28)
 * Routes match the navigation structure defined in requirements
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/gallery',
    element: <GalleryPage />,
  },
  {
    path: '/gallery/:imageId',
    element: <GalleryPage />,
  },
  {
    path: '/favorites',
    element: <FavoritesPage />,
  },
  {
    path: '/services',
    element: <ServicesPage />,
  },
  {
    path: '/platforms',
    element: <PlatformsPage />,
  },
  {
    path: '/book',
    element: <BookingPage />,
  },
  {
    path: '/etiquette',
    element: <EtiquettePage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
