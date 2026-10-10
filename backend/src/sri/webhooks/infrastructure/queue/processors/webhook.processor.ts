import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import type { Prisma } from 'src/generated/prisma/client';
import { JobsService } from '../../../../../infrastructure/jobs/jobs.service';
import { readLimitedText } from 'src/shared/utils/url.util';
import { LoggerService } from '../../../../../infrastructure/observability/logger/logger.service';
import * as crypto from 'crypto';
import { Agent } from 'undici';
import { WEBHOOK_DISPATCH_JOB } from '../../../application/contracts/webhook-job.contract';
import { SimpleCircuitBreaker } from 'src/shared/resilience/circuit-breaker';
import { resolveAndPin, SsrfBlockedError } from '../../ssrf-resolver';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

export class WebhookBusinessError extends Error {
  readonly isBusinessError = true;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, WebhookBusinessError.prototype);
  }
}

/**
 * Shape mínimo del job pg-boss que procesa este processor.
 */
type WebhookJob = {
  data: {
    configId: string;
    url: string;
    secreto: string;
    evento: string;
    payload: Record<string, unknown>;
  };
  retrycount?: number;
};

/**
 * Processor de webhooks migrado a pg-boss (PostgreSQL) usando Prisma.
 *
 * SSRF note (issue #149): DNS is resolved HERE and the first public IP is
 * pinned into an undici Agent (per-job). The fetch reuses that Agent via the
 * `dispatcher` option instead of re-resolving DNS at connect time, closing
 * the DNS-rebinding window between validation and connect.
 */
@LogContext()
@Injectable()
export class WebhookProcessor implements OnModuleInit {
  private readonly breakers = new Map<string, SimpleCircuitBreaker>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
    private readonly logger: LoggerService,
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
          this.logger,
          host,
          10,
          60000,
          (err) => !!(err as { isBusinessError?: unknown }).isBusinessError,
        ),
      );
    }
    return this.breakers.get(host)!;
  }

  private async processWebhook(job: WebhookJob): Promise<void> {
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
    let pinnedDispatcher: Agent | null = null;

    try {
      await breaker.execute(async () => {
        let resolved;
        try {
          resolved = await resolveAndPin(url);
          pinnedDispatcher = resolved.dispatcher;
        } catch (ssrfErr) {
          // OWASP A07 audit trail: every SSRF block is logged with full URL,
          // resolved IP and reason. LoggerService is pino-backed.
          const dangerousIp =
            ssrfErr instanceof SsrfBlockedError && ssrfErr.dangerousIp
              ? ssrfErr.dangerousIp
              : 'n/a';
          this.logger.warn(
            `reason=ssrf_block url=${url} resolvedIp=${dangerousIp} msg="${(ssrfErr as Error).message}"`,
            'WebhookProcessor',
          );
          throw new WebhookBusinessError(`SSRF: ${(ssrfErr as Error).message}`);
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
          dispatcher: resolved.dispatcher,
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
    } finally {
      // Always close the per-job dispatcher to avoid leaking sockets when the
      // job ends (success, business error or thrown error).
      if (pinnedDispatcher) {
        try {
          await (pinnedDispatcher as Agent).close();
        } catch {
          /* best effort */
        }
      }
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
          payload: payload as Prisma.InputJsonValue,
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
