import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { randomBytes } from 'node:crypto';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from '../../../shared/domain/exceptions/domain.exception';
import { JobsService } from '../../../infrastructure/jobs/jobs.service';
import {
  WebhookRepository,
  WebhookConfigRecord,
  WebhookLogRecord,
} from '../domain/repositories/webhook.repository';
import {
  CreateWebhookDto,
  UpdateWebhookDto,
  WebhookResponseDto,
  WebhookSecretResponseDto,
  WebhookLogResponseDto,
  WebhookEvent,
} from '../interfaces/dto';
import {
  WEBHOOK_DISPATCH_JOB,
  WebhookJobData,
} from './contracts/webhook-job.contract';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class WebhooksService {
  constructor(
    private readonly repository: WebhookRepository,
    private readonly jobsService: JobsService,
    private readonly logger: LoggerService,
  ) {}

  // =====================
  // Event Listeners
  // =====================

  @OnEvent('comprobante.autorizado')
  async handleComprobanteAutorizado(payload: any) {
    this.logger.log(
      `Evento comprobante.autorizado recibido para ${payload.claveAcceso}`,
    );
    await this.emit('comprobante.autorizado', payload, payload.emisorId);
  }

  @OnEvent('comprobante.rechazado')
  async handleComprobanteRechazado(payload: any) {
    this.logger.log(
      `Evento comprobante.rechazado recibido para ${payload.claveAcceso}`,
    );
    await this.emit('comprobante.rechazado', payload, payload.emisorId);
  }

  // =====================
  // CRUD Operations
  // =====================

  async findAll(emisorId?: number): Promise<WebhookResponseDto[]> {
    const configs = await this.repository.findAll(emisorId);
    return configs.map((config) => this.mapToResponse(config));
  }

  async findOne(id: string): Promise<WebhookResponseDto> {
    const config = await this.repository.findById(id);

    if (!config) {
      throw new EntityNotFoundException('Webhook', id);
    }

    return this.mapToResponse(config);
  }

  async create(dto: CreateWebhookDto): Promise<WebhookSecretResponseDto> {
    const secreto = this.generateSecret();

    const config = await this.repository.create({
      nombre: dto.nombre,
      url: dto.url,
      eventos: dto.eventos,
      emisorId: dto.emisorId,
      secreto,
      reintentosMax: dto.reintentosMax || 3,
    });

    this.logger.log(`Webhook creado: ${dto.nombre} -> ${dto.url}`);
    return this.mapToSecretResponse(config);
  }

  async update(id: string, dto: UpdateWebhookDto): Promise<WebhookResponseDto> {
    await this.findOne(id);

    const config = await this.repository.update(id, {
      nombre: dto.nombre !== undefined ? dto.nombre : undefined,
      url: dto.url !== undefined ? dto.url : undefined,
      eventos: dto.eventos !== undefined ? dto.eventos : undefined,
      activo: dto.activo !== undefined ? dto.activo : undefined,
      reintentosMax:
        dto.reintentosMax !== undefined ? dto.reintentosMax : undefined,
    });

    this.logger.log(`Webhook actualizado: ${id}`);
    return this.mapToResponse(config);
  }

  async delete(id: string): Promise<WebhookResponseDto> {
    const webhook = await this.findOne(id);

    if (!webhook.activo) {
      throw new InvalidDomainOperationException(
        'El webhook ya se encuentra inactivo',
      );
    }

    const config = await this.repository.update(id, { activo: false });

    this.logger.log(`Webhook inactivado: ${id}`);
    return this.mapToResponse(config);
  }

  async regenerateSecret(id: string): Promise<WebhookSecretResponseDto> {
    await this.findOne(id);
    const newSecret = this.generateSecret();

    const config = await this.repository.update(id, { secreto: newSecret });

    this.logger.log(`Secreto regenerado para webhook: ${id}`);
    return this.mapToSecretResponse(config);
  }

  async getLogs(
    id: string,
    page = 1,
    limit = 50,
  ): Promise<{
    data: WebhookLogResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await this.findOne(id);

    if (limit > 100) limit = 100;
    const offset = (page - 1) * limit;

    const [total, logs] = await this.repository.findLogs(id, limit, offset);

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs.map((row) => this.mapLogToResponse(row)),
      total,
      page,
      totalPages,
    };
  }

  // =====================
  // Event Dispatching (pg-boss based)
  // =====================

  async emit(
    evento: WebhookEvent,
    payload: Record<string, unknown>,
    emisorId?: number,
  ): Promise<void> {
    const configs = await this.repository.findActiveByEvent(evento, emisorId);

    if (configs.length === 0) {
      return;
    }

    this.logger.log(
      `Encolando evento ${evento} a ${configs.length} webhook(s)`,
    );

    for (const config of configs) {
      const jobData: WebhookJobData = {
        configId: config.id,
        url: config.url,
        secreto: config.secreto,
        evento,
        payload,
      };

      await this.jobsService.send(WEBHOOK_DISPATCH_JOB, jobData, {
        retryLimit: config.reintentosMax || 5,
        retryBackoff: true,
        retryDelay: 3,
        retryDelayMax: 180,
      });
    }
  }

  // =====================
  // Helpers
  // =====================

  private generateSecret(): string {
    return 'whsec_' + randomBytes(24).toString('hex');
  }

  private mapToResponse(row: WebhookConfigRecord): WebhookResponseDto {
    return {
      id: row.id,
      nombre: row.nombre,
      url: row.url,
      eventos: row.eventos as WebhookEvent[],
      emisorId: row.emisorId,
      activo: row.activo,
      reintentosMax: row.reintentosMax,
      createdAt: row.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: row.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
  }

  private mapToSecretResponse(
    row: WebhookConfigRecord,
  ): WebhookSecretResponseDto {
    return {
      ...this.mapToResponse(row),
      secreto: row.secreto,
    };
  }

  private mapLogToResponse(row: WebhookLogRecord): WebhookLogResponseDto {
    return {
      id: row.id,
      evento: row.evento as WebhookEvent,
      payload: row.payload,
      statusCode: row.statusCode ?? undefined,
      respuesta: row.respuesta ?? undefined,
      intento: row.intento,
      exitoso: row.exitoso,
      error: row.error ?? undefined,
      tiempoRespuestaMs: row.tiempoRespuestaMs ?? undefined,
      createdAt: row.createdAt?.toISOString?.() || new Date().toISOString(),
    };
  }
}
