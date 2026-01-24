// src/services/metricsService.ts

import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from "web-vitals";

interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: number;
}

class MetricsService {
  private endpoint = "/api/metrics/frontend";
  private buffer: MetricData[] = [];
  private flushInterval = 10000; // Flush every 10 seconds
  private maxBufferSize = 50;

  constructor() {
    this.startAutoFlush();
    this.initWebVitals();
    this.trackPageViews();
    this.trackErrors();
  }

  /**
   * Initialize Web Vitals tracking (Core Web Vitals)
   */
  private initWebVitals() {
    // Cumulative Layout Shift
    onCLS((metric: Metric) => {
      this.recordMetric("web_vitals_cls", metric.value, {
        rating: metric.rating,
      });
    });

    // First Input Delay
    onFID((metric: Metric) => {
      this.recordMetric("web_vitals_fid", metric.value, {
        rating: metric.rating,
      });
    });

    // First Contentful Paint
    onFCP((metric: Metric) => {
      this.recordMetric("web_vitals_fcp", metric.value, {
        rating: metric.rating,
      });
    });

    // Largest Contentful Paint
    onLCP((metric: Metric) => {
      this.recordMetric("web_vitals_lcp", metric.value, {
        rating: metric.rating,
      });
    });

    // Time to First Byte
    onTTFB((metric: Metric) => {
      this.recordMetric("web_vitals_ttfb", metric.value, {
        rating: metric.rating,
      });
    });
  }

  /**
   * Track page views
   */
  private trackPageViews() {
    // Track initial page load
    this.incrementCounter("page_views_total", {
      path: window.location.pathname,
      referrer: document.referrer || "direct",
    });

    // Track route changes (for SPAs)
    let lastPath = window.location.pathname;
    setInterval(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        this.incrementCounter("page_views_total", {
          path: currentPath,
          referrer: lastPath,
        });
        lastPath = currentPath;
      }
    }, 1000);
  }

  /**
   * Track JavaScript errors
   */
  private trackErrors() {
    window.addEventListener("error", (event) => {
      this.incrementCounter("frontend_errors_total", {
        type: "error",
        message: event.message,
        filename: event.filename || "unknown",
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.incrementCounter("frontend_errors_total", {
        type: "unhandled_promise",
        message: event.reason?.toString() || "unknown",
      });
    });
  }

  /**
   * Record a metric value (for histograms/gauges)
   */
  recordMetric(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ) {
    this.buffer.push({
      name,
      value,
      labels: {
        ...labels,
        browser: this.getBrowser(),
        device: this.getDeviceType(),
      },
      timestamp: Date.now(),
    });

    this.flushIfNeeded();
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels: Record<string, string> = {}) {
    this.recordMetric(name, 1, labels);
  }

  /**
   * Track paste creation from frontend
   */
  trackPasteCreated(
    language: string,
    hasPassword: boolean,
    isPrivate: boolean
  ) {
    this.incrementCounter("frontend_paste_created", {
      language,
      has_password: hasPassword.toString(),
      is_private: isPrivate.toString(),
    });
  }

  /**
   * Track paste view from frontend
   */
  trackPasteViewed(language: string, hasPassword: boolean) {
    this.incrementCounter("frontend_paste_viewed", {
      language,
      has_password: hasPassword.toString(),
    });
  }

  /**
   * Track button clicks
   */
  trackButtonClick(buttonName: string, location: string) {
    this.incrementCounter("frontend_button_clicks_total", {
      button: buttonName,
      location,
    });
  }

  /**
   * Track form submissions
   */
  trackFormSubmit(formName: string, success: boolean) {
    this.incrementCounter("frontend_form_submissions_total", {
      form: formName,
      success: success.toString(),
    });
  }

  /**
   * Track API call performance from frontend
   */
  trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    status: number
  ) {
    this.recordMetric("frontend_api_call_duration", duration, {
      endpoint,
      method,
      status: status.toString(),
    });

    this.incrementCounter("frontend_api_calls_total", {
      endpoint,
      method,
      status: status.toString(),
    });
  }

  /**
   * Track copy action
   */
  trackCopy(type: string) {
    this.incrementCounter("frontend_copy_actions_total", {
      type, // 'paste_content', 'paste_link', etc.
    });
  }

  /**
   * Track download action
   */
  trackDownload(fileType: string) {
    this.incrementCounter("frontend_download_actions_total", {
      file_type: fileType,
    });
  }

  /**
   * Get browser name
   */
  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "firefox";
    if (ua.includes("Chrome")) return "chrome";
    if (ua.includes("Safari")) return "safari";
    if (ua.includes("Edge")) return "edge";
    return "other";
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return "mobile";
    if (/tablet/i.test(ua)) return "tablet";
    return "desktop";
  }

  /**
   * Flush metrics to backend
   */
  private async flush() {
    if (this.buffer.length === 0) return;

    const metricsToSend = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metrics: metricsToSend }),
      });
    } catch (error) {
      console.error("Failed to send metrics:", error);
      // Don't re-add to buffer to avoid memory issues
    }
  }

  /**
   * Flush if buffer is full
   */
  private flushIfNeeded() {
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Auto-flush metrics periodically
   */
  private startAutoFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener("beforeunload", () => {
      // Use sendBeacon for reliability
      if (this.buffer.length > 0) {
        navigator.sendBeacon(
          this.endpoint,
          JSON.stringify({ metrics: this.buffer })
        );
      }
    });
  }
}

// Create singleton instance
const metricsService = new MetricsService();

export default metricsService;
