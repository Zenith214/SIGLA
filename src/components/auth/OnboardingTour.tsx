"use client";

import { useEffect, useRef } from "react";

interface OnboardingTourProps {
  shouldStart: boolean;
  onComplete: () => void;
}

export default function OnboardingTour({ shouldStart, onComplete }: OnboardingTourProps) {
  const introRef = useRef<any>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!shouldStart || hasStarted.current) return;

    hasStarted.current = true;

    // Dynamic import to avoid SSR issues
    const loadIntro = async () => {
      const introJs = (await import("intro.js")).default;

      const timer = setTimeout(() => {
        // Check if map or list view is active
        const isMapView = document.querySelector('[data-tour="map-view"]') !== null;
        const isListView = document.querySelector('[data-tour="list-view"]') !== null;

        let dashboardTitle = '📊 Dashboard Overview';
        let dashboardDescription = 'View the Satisfaction Index and barangay performance metrics.';
        
        if (isMapView) {
          dashboardTitle = '🗺️ Map View';
          dashboardDescription = 'This is the interactive map view. Click on barangays to see detailed information and satisfaction scores.';
        } else if (isListView) {
          dashboardTitle = '📋 List View';
          dashboardDescription = 'This is the list view showing all barangays. You can search, filter, and click on any barangay for details.';
        }

        introRef.current = introJs();
        
        introRef.current.setOptions({
          steps: [
            {
              title: '👋 Welcome to PULSE!',
              intro: 'Let\'s take a quick tour to help you get started with the system. This will only take a minute!',
            },
            {
              element: document.querySelector('[data-tour="navigation-menu"]'),
              title: '📍 Navigation Menu',
              intro: 'Access all main features from here: Dashboard, Reports, Survey Management, and Settings.',
              position: 'bottom'
            },
            {
              element: document.querySelector('[data-tour="cycle-selector"]'),
              title: '📅 Active Survey Cycle',
              intro: 'The current survey cycle is displayed here. All data shown is filtered by this cycle.',
              position: 'bottom'
            },
            {
              element: document.querySelector('[data-tour="user-menu"]'),
              title: '👤 User Menu',
              intro: 'Access your profile, notifications, and logout from here.',
              position: 'bottom-right-aligned'
            },
            {
              element: document.querySelector('[data-tour="dashboard-content"]'),
              title: dashboardTitle,
              intro: dashboardDescription,
              position: 'top'
            },
            {
              element: document.querySelector('[data-tour="help-button"]'),
              title: '❓ Help Button',
              intro: 'Need help? Click this button anytime for context-specific guidance on any page.',
              position: 'top-left-aligned'
            },
            {
              title: '🎉 You\'re All Set!',
              intro: 'You\'re ready to start using PULSE. Remember, you can always access help by clicking the (?) button. Good luck!',
            }
          ],
          showProgress: true,
          showBullets: false,
          exitOnOverlayClick: false,
          exitOnEsc: true,
          nextLabel: 'Next →',
          prevLabel: '← Previous',
          doneLabel: 'Get Started!',
          overlayOpacity: 0.8,
          scrollToElement: false,
          scrollPadding: 30,
          disableInteraction: false,
        });

        introRef.current.oncomplete(() => {
          hasStarted.current = false;
          onComplete();
        });

        introRef.current.onexit(() => {
          hasStarted.current = false;
          onComplete();
        });

        introRef.current.start();
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    };

    loadIntro();

    return () => {
      if (introRef.current) {
        try {
          introRef.current.exit(false);
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      hasStarted.current = false;
    };
  }, [shouldStart, onComplete]);

  return null;
}
