"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import FirstTimePasswordChangeModal from "./FirstTimePasswordChangeModal";
import OnboardingTour from "./OnboardingTour";

interface FirstTimeLoginWrapperProps {
  children: React.ReactNode;
}

export default function FirstTimeLoginWrapper({ children }: FirstTimeLoginWrapperProps) {
  const { user, refreshUser } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [startTour, setStartTour] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    // Check if user is first-time login
    if (user && !hasChecked) {
      setHasChecked(true);
      
      // If firstLogin is true and on dashboard, show password modal
      if ((user as any).firstLogin === true && window.location.pathname === '/dashboard') {
        setShowPasswordModal(true);
      }
    }
  }, [user, hasChecked]);

  const handlePasswordChangeSuccess = async () => {
    setShowPasswordModal(false);
    setPasswordChanged(true);
    
    // Don't update firstLogin yet - wait for tour completion
    // Start tour after password change if on dashboard
    if (window.location.pathname === '/dashboard') {
      setTimeout(() => setStartTour(true), 1000);
    }
  };

  const handleTourComplete = async () => {
    setStartTour(false);
    
    // Save to localStorage for immediate effect
    localStorage.setItem('onboardingTourCompleted', 'true');
    
    // Mark firstLogin as false - onboarding is now complete
    try {
      await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Refresh user data to get updated firstLogin status
      await refreshUser();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  return (
    <>
      {children}
      <FirstTimePasswordChangeModal
        isOpen={showPasswordModal}
        onSuccess={handlePasswordChangeSuccess}
      />
      <OnboardingTour
        shouldStart={startTour}
        onComplete={handleTourComplete}
      />
    </>
  );
}
