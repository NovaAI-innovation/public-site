import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { routes } from './routes';
import { createRoutesFromElements, RouterProvider } from 'react-router-dom';

// Helper to render routes with MemoryRouter
function renderRoutes(path: string) {
  const router = createRoutesFromElements(
    routes.map((route) => {
      return (
        <div key={route.path}>
          {route.element}
        </div>
      );
    })
  );

  return render(
    <MemoryRouter initialEntries={[path]}>
      <RouterProvider router={router} />
    </MemoryRouter>
  );
}

describe('routes', () => {
  it('defines all required routes', () => {
    const routePaths = routes.map((route) => route.path);
    
    expect(routePaths).toContain('/');
    expect(routePaths).toContain('/gallery');
    expect(routePaths).toContain('/favorites');
    expect(routePaths).toContain('/services');
    expect(routePaths).toContain('/platforms');
    expect(routePaths).toContain('/book');
    expect(routePaths).toContain('/etiquette');
    expect(routePaths).toContain('/about');
    expect(routePaths).toContain('/404');
    expect(routePaths).toContain('*');
  });

  it('has catch-all route as last route', () => {
    const lastRoute = routes[routes.length - 1];
    expect(lastRoute.path).toBe('*');
  });

  it('has 11 routes defined', () => {
    expect(routes).toHaveLength(11);
  });
});
