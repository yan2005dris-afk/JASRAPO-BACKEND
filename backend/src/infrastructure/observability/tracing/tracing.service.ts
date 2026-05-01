import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { createSampler, getTracingConfig } from './sampling.config';

@Injectable()
export class TracingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TracingService.name);
  private sdk: NodeSDK | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const metricsEnabled = this.configService.get<boolean>(
      'OTEL_METRICS_ENABLED',
      false,
    );

    if (!metricsEnabled) {
      this.logger.warn(
        'OpenTelemetry tracing is disabled. Set OTEL_METRICS_ENABLED=true to enable.',
      );
      return;
    }

    try {
      await this.initializeTracing();
    } catch (error) {
      this.logger.error('Failed to initialize OpenTelemetry tracing', error);
    }
  }

  private async initializeTracing(): Promise<void> {
    const config = getTracingConfig(this.configService);
    const sampler = createSampler(this.configService);

    this.logger.log(
      `Initializing OpenTelemetry with endpoint: ${config.otlpEndpoint}`,
    );

    const traceExporter = new OTLPTraceExporter({
      url: `${config.otlpEndpoint}/v1/traces`,
    });

    this.sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
          this.configService.get<string>('NODE_ENV', 'development'),
      }),
      traceExporter,
      sampler,
      instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new PgInstrumentation({
          enhancedDatabaseReporting: true,
        }),
        ...getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
        }),
      ],
    });

    this.sdk.start();
    this.logger.log('OpenTelemetry SDK started successfully');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.sdk) {
      await this.sdk.shutdown();
      this.logger.log('OpenTelemetry SDK stopped');
    }
  }

  isEnabled(): boolean {
    return (
      this.configService.get<boolean>('OTEL_METRICS_ENABLED', false) &&
      this.sdk !== null
    );
  }
}
