import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { MetricsModule } from './metrics/metrics.module';
import { TracingModule } from './tracing/tracing.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  imports: [LoggerModule, MetricsModule, TracingModule],
  providers: [LoggingInterceptor],
  exports: [LoggerModule, MetricsModule, TracingModule, LoggingInterceptor],
})
export class ObservabilityModule {}