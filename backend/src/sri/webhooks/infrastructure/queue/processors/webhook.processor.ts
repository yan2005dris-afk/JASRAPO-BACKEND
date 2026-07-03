import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { JobsService } from '../../../../../infrastructure/jobs/jobs.service';
import {
  validateSafeUrl,
  readLimitedText,
} from '../../../../../infrastructure/common/utils/url.util';
import * as crypto from 'crypto';
import { Agent } from 'undici';
import { WEBHOOK_DISPATCH_JOB } from '../../../application/contracts/webhook-job.contract';
import { SimpleCircuitBreaker } from '../../../../../infrastructure/common/resilience/circuit-breaker';

export class WebhookBusinessError extends Error {
  readonly isBusinessError = true;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, WebhookBusinessError.prototype);
  }
}

// Bulkhead connection pool configuration using undici Agent
const globalDispatcher = new Agent({
  connections: 50, // maxSockets limit
  pipelining: 1,
});

/**
 * Processor de webhooks migrado a pg-boss (PostgreSQL) usando Prisma.
 */
@Injectable()
export class WebhookProcessor implements OnModuleInit {
  private readonly logger = new Logger(WebhookProcessor.name);
  private readonly breakers = new Map<string, SimpleCircuitBreaker>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
  ) {}

  async onModuleInit() {
    await this.jobsService.work(WEBHOOK_DISPATCH_JOB, async ([job]) => {
      if (job) {
        try {
          await this.processWebhook(job);
        } catch (error) {
          // If it is a business error (4xx/5xx responses), log and do NOT retry
          if (error.isBusinessError) {
            this.logger.warn(
              `[Webhook] No se reintentará debido a error de negocio (4xx/5xx): ${(error as Error).message}`,
            );
            return; // Resolves promise -> success in pg-boss
          }
          throw error; // Rethrows -> failure and retry in pg-boss
        }
      }
    });
    this.logger.log(
      `Worker de Webhooks escuchando en PostgreSQL (job: ${WEBHOOK_DISPATCH_JOB})`,
    );
  }

  private getCircuitBreaker(url: string): SimpleCircuitBreaker {
    let host: string;
    try {
      host = new URL(url).host;
    } catch {
      host = url;
    }

    if (!this.breakers.has(host)) {
      this.breakers.set(
        host,
        new SimpleCircuitBreaker(
          host,
          10,
          60000,
          (err) => !!err.isBusinessError,
        ),
      );
    }
    return this.breakers.get(host)!;
  }

  private async processWebhook(job: any): Promise<void> {
    const { configId, url, secreto, evento, payload } = job.data;
    const attempt = (job.retrycount || 0) + 1;
    const startTime = Date.now();

    this.logger.log(
      `[Webhook] Enviando ${evento} a ${url} (intento ${attempt})`,
    );

    const body = JSON.stringify({
      evento,
      payload,
      timestamp: new Date().toISOString(),
    });

    const signature = crypto
      .createHmac('sha256', secreto)
      .update(body)
      .digest('hex');

    const breaker = this.getCircuitBreaker(url);

    try {
      await breaker.execute(async () => {
        const urlValidation = await validateSafeUrl(url);
        if (!urlValidation.safe) {
          throw new WebhookBusinessError(
            `SSRF Prevention: ${urlValidation.error}`,
          );
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': evento,
            'X-Webhook-Attempt': String(attempt),
          },
          body,
          redirect: 'error',
          signal: AbortSignal.timeout(30000),
          dispatcher: globalDispatcher,
        } as any);

        const tiempoRespuesta = Date.now() - startTime;
        const respuestaText = await readLimitedText(response);

        // Log del intento
        await this.logWebhook(
          configId,
          evento,
          payload,
          response.status,
          respuestaText,
          attempt,
          response.ok,
          null,
          tiempoRespuesta,
        );

        if (!response.ok) {
          throw new WebhookBusinessError(
            `Webhook respondió con status ${response.status}: ${respuestaText.substring(0, 200)}`,
          );
        }

        this.logger.log(
          `[Webhook] ✅ ${evento} enviado exitosamente a ${url} en ${tiempoRespuesta}ms`,
        );
      });
    } catch (error) {
      const tiempoRespuesta = Date.now() - startTime;

      if (!error.isBusinessError) {
        await this.logWebhook(
          configId,
          evento,
          payload,
          null,
          null,
          attempt,
          false,
          (error as Error).message,
          tiempoRespuesta,
        );

        this.logger.error(
          `[Webhook] ❌ Fallo enviando ${evento} a ${url} (intento ${attempt}): ${(error as Error).message}`,
        );
      }

      throw error;
    }
  }

  private async logWebhook(
    configId: string,
    evento: string,
    payload: Record<string, unknown>,
    statusCode: number | null,
    respuesta: string | null,
    intento: number,
    exitoso: boolean,
    error: string | null,
    tiempoRespuestaMs: number,
  ): Promise<void> {
    try {
      await this.prisma.webhookLogs.create({
        data: {
          configId,
          evento,
          payload: payload as any,
          statusCode,
          respuesta,
          intento,
          exitoso,
          error,
          tiempoRespuestaMs,
        },
      });
    } catch (logError) {
      this.logger.error(
        `Error al registrar webhook log: ${(logError as Error).message}`,
      );
    }
  }
}
