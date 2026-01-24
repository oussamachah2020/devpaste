import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const route = req.route?.path || req.path;
    const method = req.method;

    // Increment in-progress requests
    this.metricsService.incrementHttpRequestsInProgress(method, route);

    // Track when response finishes
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000; // Convert to seconds
      const statusCode = res.statusCode;

      // Record metrics
      this.metricsService.incrementHttpRequest(method, route, statusCode);
      this.metricsService.observeHttpRequestDuration(
        method,
        route,
        statusCode,
        duration,
      );
      this.metricsService.decrementHttpRequestsInProgress(method, route);

      // Track errors (4xx and 5xx status codes)
      if (statusCode >= 400) {
        const errorType = statusCode >= 500 ? 'server_error' : 'client_error';
        this.metricsService.incrementError(errorType, route);
      }
    });

    next();
  }
}
