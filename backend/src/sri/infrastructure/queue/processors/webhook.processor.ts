import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { JobsService } from '../../../../infrastructure/jobs/jobs.service';
import {
  validateSafeUrl,
  readLimitedText,
} from '../../../../infrastructure/common/utils/url.util';
import * as crypto from 'crypto';

export const WEBHOOK_DISPATCH_JOB = 'webhook-dispatch';

export interface WebhookJobData {
  configId: string;
  url: string;
  secreto: string;
  evento: string;
  payload: Record<string, unknown>;
}

/**
 * Processor de webhooks migrado a pg-boss (PostgreSQL) usando Prisma.
 */
@Injectable()
export class WebhookProcessor implements OnModuleInit {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
  ) {}

  async onModuleInit() {
    await this.jobsService.work(WEBHOOK_DISPATCH_JOB, async ([job]) => {
      if (job) {
        await this.processWebhook(job);
      }
    });
    this.logger.log(
      `Worker de Webhooks escuchando en PostgreSQL (job: ${WEBHOOK_DISPATCH_JOB})`,
    );
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

    try {
      const urlValidation = await validateSafeUrl(url);
      if (!urlValidation.safe) {
        throw new Error(`SSRF Prevention: ${urlValidation.error}`);
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
      });

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
        throw new Error(
          `Webhook respondió con status ${response.status}: ${respuestaText.substring(0, 200)}`,
        );
      }

      this.logger.log(
        `[Webhook] ✅ ${evento} enviado exitosamente a ${url} en ${tiempoRespuesta}ms`,
      );
    } catch (error) {
      const tiempoRespuesta = Date.now() - startTime;

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
