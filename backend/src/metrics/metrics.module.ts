import { MetricsController } from './metrics.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FrontendMetricsController } from './frontend-metrics.controller';
import { FrontendMetricsService } from './frontend-metrics.service';
import { MetricsMiddleware } from './metrics.middleware';
import { MetricsService } from './metrics.service';

@Module({
  controllers: [MetricsController, FrontendMetricsController],
  providers: [MetricsService, FrontendMetricsService],
  exports: [MetricsService, FrontendMetricsService],
})
export class MetricsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).exclude('metrics').forRoutes('*');
  }
}
