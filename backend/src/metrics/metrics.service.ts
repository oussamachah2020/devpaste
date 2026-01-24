import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Gauge,
  register,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  // HTTP Metrics
  private readonly httpRequestsTotal: Counter;
  private readonly httpRequestDuration: Histogram;
  private readonly httpRequestsInProgress: Gauge;

  // Paste Metrics
  private readonly pastesCreatedTotal: Counter;
  private readonly pastesViewedTotal: Counter;
  private readonly pastesByLanguage: Counter;
  private readonly passwordProtectedPastes: Counter;
  private readonly burnAfterReadPastes: Counter;
  private readonly privatePastes: Counter;

  // Cache Metrics
  private readonly cacheHits: Counter;
  private readonly cacheMisses: Counter;

  // Database Metrics
  private readonly dbQueriesTotal: Counter;
  private readonly dbQueryDuration: Histogram;

  // Error Metrics
  private readonly errorsTotal: Counter;

  constructor() {
    // Enable default metrics (CPU, Memory, etc.)
    collectDefaultMetrics({ register });

    // HTTP Request metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1, 5],
    });

    this.httpRequestsInProgress = new Gauge({
      name: 'http_requests_in_progress',
      help: 'Current number of HTTP requests in progress',
      labelNames: ['method', 'route'],
    });

    // Paste creation metrics
    this.pastesCreatedTotal = new Counter({
      name: 'pastes_created_total',
      help: 'Total number of pastes created',
      labelNames: ['language', 'has_password', 'is_private', 'burn_after_read'],
    });

    this.pastesViewedTotal = new Counter({
      name: 'pastes_viewed_total',
      help: 'Total number of paste views',
      labelNames: ['language', 'has_password'],
    });

    this.pastesByLanguage = new Counter({
      name: 'pastes_by_language_total',
      help: 'Count of pastes by programming language',
      labelNames: ['language'],
    });

    this.passwordProtectedPastes = new Counter({
      name: 'password_protected_pastes_total',
      help: 'Total number of password-protected pastes',
    });

    this.burnAfterReadPastes = new Counter({
      name: 'burn_after_read_pastes_total',
      help: 'Total number of burn-after-read pastes',
    });

    this.privatePastes = new Counter({
      name: 'private_pastes_total',
      help: 'Total number of private pastes',
    });

    // Cache metrics
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_key'],
    });

    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_key'],
    });

    // Database metrics
    this.dbQueriesTotal = new Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table'],
    });

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    });

    // Error metrics
    this.errorsTotal = new Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'route'],
    });
  }

  // HTTP Metrics Methods
  incrementHttpRequest(method: string, route: string, statusCode: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
  }

  observeHttpRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ) {
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration,
    );
  }

  incrementHttpRequestsInProgress(method: string, route: string) {
    this.httpRequestsInProgress.inc({ method, route });
  }

  decrementHttpRequestsInProgress(method: string, route: string) {
    this.httpRequestsInProgress.dec({ method, route });
  }

  // Paste Metrics Methods
  incrementPasteCreated(
    language: string,
    hasPassword: boolean,
    isPrivate: boolean,
    burnAfterRead: boolean,
  ) {
    this.pastesCreatedTotal.inc({
      language,
      has_password: hasPassword.toString(),
      is_private: isPrivate.toString(),
      burn_after_read: burnAfterRead.toString(),
    });

    this.pastesByLanguage.inc({ language });

    if (hasPassword) {
      this.passwordProtectedPastes.inc();
    }

    if (burnAfterRead) {
      this.burnAfterReadPastes.inc();
    }

    if (isPrivate) {
      this.privatePastes.inc();
    }
  }

  incrementPasteViewed(language: string, hasPassword: boolean) {
    this.pastesViewedTotal.inc({
      language,
      has_password: hasPassword.toString(),
    });
  }

  // Cache Metrics Methods
  incrementCacheHit(cacheKey: string) {
    this.cacheHits.inc({ cache_key: cacheKey });
  }

  incrementCacheMiss(cacheKey: string) {
    this.cacheMisses.inc({ cache_key: cacheKey });
  }

  // Database Metrics Methods
  incrementDbQuery(operation: string, table: string) {
    this.dbQueriesTotal.inc({ operation, table });
  }

  observeDbQueryDuration(operation: string, table: string, duration: number) {
    this.dbQueryDuration.observe({ operation, table }, duration);
  }

  // Error Metrics Methods
  incrementError(type: string, route: string) {
    this.errorsTotal.inc({ type, route });
  }

  // Get all metrics
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Reset all metrics (useful for testing)
  resetMetrics() {
    register.resetMetrics();
  }
}
