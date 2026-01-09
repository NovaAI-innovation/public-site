import React, { Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { AgeVerificationProvider, useAgeVerification } from './contexts/AgeVerificationContext';
import { AgeVerification } from './components/features/auth/AgeVerification/AgeVerification';
import { LoadingSpinner } from './components/ui/LoadingSpinner/LoadingSpinner';
import { Navigation } from './components/features/navigation';
import { routes } from './routes/routes';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

/**
 * Routes component - renders routes with Suspense boundary for lazy loading
 * Provides loading fallback for route-based code splitting (FR35, NFR-P28)
 */
function AppRoutes() {
  const element = useRoutes(routes);

  return (
    <Suspense
      fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <LoadingSpinner size="large" message="Loading page..." />
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

/**
 * AgeVerificationModal - wrapper component that displays age verification modal
 * Uses context to determine when to show modal (AC: #1, #4)
 */
function AgeVerificationModal() {
  const { isModalOpen, verifyAge, declineAge } = useAgeVerification();

  return (
    <AgeVerification
      isOpen={isModalOpen}
      onVerify={verifyAge}
      onDecline={declineAge}
    />
  );
}

/**
 * App component - root component with providers and routing
 * Sets up React Query, Favorites context, Age Verification context, and React Router (FR35)
 * Age verification modal is displayed when user hasn't verified age (FR47, FR50)
 */
function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AgeVerificationProvider>
          <FavoritesProvider>
            <BrowserRouter>
              <div className="App">
                <AgeVerificationModal />
                <Navigation />
                <AppRoutes />
              </div>
            </BrowserRouter>
          </FavoritesProvider>
        </AgeVerificationProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
