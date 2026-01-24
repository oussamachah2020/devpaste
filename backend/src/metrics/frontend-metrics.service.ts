// src/metrics/frontend-metrics.service.ts

import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class FrontendMetricsService {
  // Page view metrics
  private readonly pageViewsTotal: Counter;

  // User interaction metrics
  private readonly buttonClicksTotal: Counter;
  private readonly formSubmissionsTotal: Counter;
  private readonly copyActionsTotal: Counter;
  private readonly downloadActionsTotal: Counter;

  // Frontend paste metrics
  private readonly frontendPasteCreated: Counter;
  private readonly frontendPasteViewed: Counter;
  private readonly frontendBurnAfterReadPastes: Counter;

  // Frontend API call metrics
  private readonly frontendApiCallsTotal: Counter;
  private readonly frontendApiCallDuration: Histogram;

  // Frontend error metrics
  private readonly frontendErrorsTotal: Counter;

  // Web Vitals metrics
  private readonly webVitalsCls: Histogram;
  private readonly webVitalsFid: Histogram;
  private readonly webVitalsFcp: Histogram;
  private readonly webVitalsLcp: Histogram;
  private readonly webVitalsTtfb: Histogram;

  constructor() {
    // Page views
    this.pageViewsTotal = new Counter({
      name: 'frontend_page_views_total',
      help: 'Total page views',
      labelNames: ['path', 'page', 'referrer', 'browser', 'device'],
    });

    // User interactions
    this.buttonClicksTotal = new Counter({
      name: 'frontend_button_clicks_total',
      help: 'Total button clicks',
      labelNames: ['button', 'location', 'browser', 'device'],
    });

    this.formSubmissionsTotal = new Counter({
      name: 'frontend_form_submissions_total',
      help: 'Total form submissions',
      labelNames: ['form', 'success', 'browser', 'device'],
    });

    this.copyActionsTotal = new Counter({
      name: 'frontend_copy_actions_total',
      help: 'Total copy actions',
      labelNames: ['type', 'browser', 'device'],
    });

    this.downloadActionsTotal = new Counter({
      name: 'frontend_download_actions_total',
      help: 'Total download actions',
      labelNames: ['file_type', 'browser', 'device'],
    });

    // Frontend paste tracking
    this.frontendPasteCreated = new Counter({
      name: 'frontend_paste_created_total',
      help: 'Pastes created from frontend',
      labelNames: [
        'language',
        'has_password',
        'is_private',
        'browser',
        'device',
      ],
    });

    this.frontendPasteViewed = new Counter({
      name: 'frontend_paste_viewed_total',
      help: 'Pastes viewed from frontend',
      labelNames: ['language', 'has_password', 'browser', 'device'],
    });

    this.frontendBurnAfterReadPastes = new Counter({
      name: 'frontend_burn_after_read_pastes_total',
      help: 'Burn after read pastes created from frontend',
      labelNames: ['browser', 'device'],
    });

    // Frontend API calls
    this.frontendApiCallsTotal = new Counter({
      name: 'frontend_api_calls_total',
      help: 'API calls made from frontend',
      labelNames: ['endpoint', 'method', 'status', 'browser', 'device'],
    });

    this.frontendApiCallDuration = new Histogram({
      name: 'frontend_api_call_duration_ms',
      help: 'Frontend API call duration in milliseconds',
      labelNames: ['endpoint', 'method', 'status', 'browser', 'device'],
      buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
    });

    // Frontend errors
    this.frontendErrorsTotal = new Counter({
      name: 'frontend_errors_total',
      help: 'Total frontend errors',
      labelNames: ['type', 'message', 'filename', 'browser', 'device'],
    });

    // Web Vitals
    this.webVitalsCls = new Histogram({
      name: 'web_vitals_cls',
      help: 'Cumulative Layout Shift',
      labelNames: ['rating', 'browser', 'device'],
      buckets: [0.1, 0.25, 0.5, 0.75, 1, 2, 5],
    });

    this.webVitalsFid = new Histogram({
      name: 'web_vitals_fid_ms',
      help: 'First Input Delay in milliseconds',
      labelNames: ['rating', 'browser', 'device'],
      buckets: [10, 50, 100, 200, 300, 500, 1000],
    });

    this.webVitalsFcp = new Histogram({
      name: 'web_vitals_fcp_ms',
      help: 'First Contentful Paint in milliseconds',
      labelNames: ['rating', 'browser', 'device'],
      buckets: [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000],
    });

    this.webVitalsLcp = new Histogram({
      name: 'web_vitals_lcp_ms',
      help: 'Largest Contentful Paint in milliseconds',
      labelNames: ['rating', 'browser', 'device'],
      buckets: [1000, 1500, 2000, 2500, 3000, 4000, 5000, 10000],
    });

    this.webVitalsTtfb = new Histogram({
      name: 'web_vitals_ttfb_ms',
      help: 'Time to First Byte in milliseconds',
      labelNames: ['rating', 'browser', 'device'],
      buckets: [100, 200, 300, 500, 800, 1000, 1500, 2000],
    });
  }

  recordMetric(name: string, value: number, labels: Record<string, string>) {
    switch (name) {
      case 'page_views_total':
      case 'frontend_page_views_total':
        this.pageViewsTotal.inc(labels);
        break;

      case 'frontend_button_clicks_total':
        this.buttonClicksTotal.inc(labels);
        break;

      case 'frontend_form_submissions_total':
        this.formSubmissionsTotal.inc(labels);
        break;

      case 'frontend_copy_actions_total':
        this.copyActionsTotal.inc(labels);
        break;

      case 'frontend_download_actions_total':
        this.downloadActionsTotal.inc(labels);
        break;

      case 'frontend_paste_created':
        this.frontendPasteCreated.inc(labels);
        break;

      case 'frontend_paste_viewed':
        this.frontendPasteViewed.inc(labels);
        break;

      case 'frontend_burn_after_read_pastes':
        this.frontendBurnAfterReadPastes.inc(labels);
        break;

      case 'frontend_api_calls_total':
        this.frontendApiCallsTotal.inc(labels);
        break;

      case 'frontend_api_call_duration':
        this.frontendApiCallDuration.observe(labels, value);
        break;

      case 'frontend_errors_total':
        this.frontendErrorsTotal.inc(labels);
        break;

      // Web Vitals
      case 'web_vitals_cls':
        this.webVitalsCls.observe(labels, value);
        break;

      case 'web_vitals_fid':
        this.webVitalsFid.observe(labels, value);
        break;

      case 'web_vitals_fcp':
        this.webVitalsFcp.observe(labels, value);
        break;

      case 'web_vitals_lcp':
        this.webVitalsLcp.observe(labels, value);
        break;

      case 'web_vitals_ttfb':
        this.webVitalsTtfb.observe(labels, value);
        break;

      default:
        console.warn(`Unknown frontend metric: ${name}`);
    }
  }
}
