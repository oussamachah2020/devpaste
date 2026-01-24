// src/hooks/useMetrics.ts

import { useEffect, useCallback } from "react";
import metricsService from "../services/metricsService";

export const useMetrics = () => {
  /**
   * Track page view on component mount
   */
  const trackPageView = useCallback((pageName: string) => {
    metricsService.incrementCounter("page_views_total", {
      page: pageName,
    });
  }, []);

  /**
   * Track button click
   */
  const trackClick = useCallback((buttonName: string, location?: string) => {
    metricsService.trackButtonClick(
      buttonName,
      location || window.location.pathname
    );
  }, []);

  /**
   * Track paste creation
   */
  const trackPasteCreated = useCallback(
    (
      language: string,
      options: {
        hasPassword?: boolean;
        isPrivate?: boolean;
        burnAfterRead?: boolean;
      }
    ) => {
      metricsService.trackPasteCreated(
        language,
        options.hasPassword || false,
        options.isPrivate || false
      );

      if (options.burnAfterRead) {
        metricsService.incrementCounter("frontend_burn_after_read_pastes");
      }
    },
    []
  );

  /**
   * Track paste view
   */
  const trackPasteViewed = useCallback(
    (language: string, hasPassword: boolean) => {
      metricsService.trackPasteViewed(language, hasPassword);
    },
    []
  );

  /**
   * Track API call
   */
  const trackApiCall = useCallback(
    (endpoint: string, method: string, duration: number, status: number) => {
      metricsService.trackApiCall(endpoint, method, duration, status);
    },
    []
  );

  /**
   * Track copy action
   */
  const trackCopy = useCallback((type: string) => {
    metricsService.trackCopy(type);
  }, []);

  /**
   * Track download
   */
  const trackDownload = useCallback((fileType: string) => {
    metricsService.trackDownload(fileType);
  }, []);

  /**
   * Track form submission
   */
  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    metricsService.trackFormSubmit(formName, success);
  }, []);

  return {
    trackPageView,
    trackClick,
    trackPasteCreated,
    trackPasteViewed,
    trackApiCall,
    trackCopy,
    trackDownload,
    trackFormSubmit,
  };
};

/**
 * Hook to track page view on mount
 */
export const usePageView = (pageName: string) => {
  useEffect(() => {
    metricsService.incrementCounter("page_views_total", {
      page: pageName,
    });
  }, [pageName]);
};
