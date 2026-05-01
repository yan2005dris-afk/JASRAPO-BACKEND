import type { ConfigService } from '@nestjs/config';
import {
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';

/**
 * Creates the appropriate sampler based on environment and configuration.
 *
 * - Development: AlwaysOnSampler (capture all traces)
 * - Production: ParentBasedSampler with TraceIdRatioBased (0.1 = 10% sampling)
 */
export function createSampler(
  configService: ConfigService,
): ParentBasedSampler {
  const environment = configService.get<string>('NODE_ENV', 'development');
  const sampleRatio = configService.get<number>('OTEL_TRACE_SAMPLE_RATIO', 0.1);

  if (environment === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Tracing] Development environment - using AlwaysOnSampler');
    return new ParentBasedSampler({
      root: new AlwaysOnSampler(),
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    `[Tracing] Production environment - using ParentBasedSampler with ${sampleRatio} ratio`,
  );
  return new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(sampleRatio),
  });
}

export interface TracingConfig {
  serviceName: string;
  otlpEndpoint: string;
  sampleRatio: number;
}

export function getTracingConfig(configService: ConfigService): TracingConfig {
  return {
    serviceName: configService.get<string>(
      'OTEL_SERVICE_NAME',
      'jasrapo-backend',
    ),
    otlpEndpoint: configService.get<string>(
      'OTEL_EXPORTER_OTLP_ENDPOINT',
      'http://localhost:4318',
    ),
    sampleRatio: configService.get<number>('OTEL_TRACE_SAMPLE_RATIO', 0.1),
  };
}
