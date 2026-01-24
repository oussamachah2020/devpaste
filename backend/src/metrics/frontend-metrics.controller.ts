// src/metrics/frontend-metrics.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { FrontendMetricsService } from './frontend-metrics.service';

interface FrontendMetric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: number;
}

interface FrontendMetricsPayload {
  metrics: FrontendMetric[];
}

@Controller('metrics/frontend')
export class FrontendMetricsController {
  constructor(
    private readonly frontendMetricsService: FrontendMetricsService,
  ) {}

  @Post()
  async receiveFrontendMetrics(
    @Body() payload: FrontendMetricsPayload,
  ): Promise<{ received: number }> {
    // Process each metric
    for (const metric of payload.metrics) {
      this.frontendMetricsService.recordMetric(
        metric.name,
        metric.value,
        metric.labels || {},
      );
    }

    return { received: payload.metrics.length };
  }
}
