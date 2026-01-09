import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'age-verified';

interface AgeVerificationContextType {
  isVerified: boolean;
  isModalOpen: boolean;
  verifyAge: () => void;
  declineAge: () => void;
  checkVerificationStatus: () => boolean;
}

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined);

/**
 * AgeVerificationContext - manages age verification state
 * Stores verification status in localStorage with key 'age-verified' (Story 5.2)
 * Checks localStorage on mount to persist across sessions (AC: #1, FR48, FR49)
 * Shows modal if not verified (AC: #1)
 * Prevents access to site until verified (AC: #1)
 */
export function AgeVerificationProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage on mount (Task 3: AC: #1)
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch (error) {
      console.error('Failed to initialize age verification status from localStorage:', error);
      return false;
    }
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Check verification status from localStorage (Task 2: AC: #1)
  const checkVerificationStatus = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch (error) {
      console.error('Failed to check age verification status from localStorage:', error);
      return false;
    }
  }, []);

  // Check localStorage on app load and sync state (Task 2, Task 3: AC: #1)
  useEffect(() => {
    const verified = checkVerificationStatus();
    setIsVerified(verified);
    // Show modal if not verified (AC: #1)
    if (!verified) {
      setIsModalOpen(true);
    }
  }, [checkVerificationStatus]);

  // Handle age verification - user confirms they are 18+ (Task 1: AC: #1)
  // Store verification status in localStorage with key 'age-verified' and value 'true' (FR48, FR49)
  const verifyAge = useCallback(() => {
    try {
      // Save verification status to localStorage (Task 1: AC: #1)
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsVerified(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save age verification status:', error);
      // Still allow access if localStorage fails (graceful degradation)
      setIsVerified(true);
      setIsModalOpen(false);
    }
  }, []);

  // Handle age decline - user is under 18 (AC: #1)
  // Redirect away from site (FR50, Task 3)
  const declineAge = useCallback(() => {
    setIsModalOpen(false);
    
    // Show user-friendly message before redirect (Task 3)
    // Use setTimeout to ensure message is visible briefly before redirect
    setTimeout(() => {
      // Redirect away from site (AC: #1, FR50)
      // Use a safe external site or appropriate redirect URL
      // For age-restricted content, typically redirect to a safe for work site
      window.location.href = 'https://www.google.com';
    }, 100);
  }, []);

  const value: AgeVerificationContextType = {
    isVerified,
    isModalOpen,
    verifyAge,
    declineAge,
    checkVerificationStatus,
  };

  return (
    <AgeVerificationContext.Provider value={value}>
      {children}
    </AgeVerificationContext.Provider>
  );
}

/**
 * Hook to access age verification context
 */
export function useAgeVerification() {
  const context = useContext(AgeVerificationContext);
  if (context === undefined) {
    throw new Error('useAgeVerification must be used within an AgeVerificationProvider');
  }
  return context;
}