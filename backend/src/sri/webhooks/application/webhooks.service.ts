import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { JobsService } from '../../../infrastructure/jobs/jobs.service';
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

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
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
    const configs = await this.prisma.webhookConfigs.findMany({
      where: emisorId ? { emisorId } : {},
      orderBy: { createdAt: 'desc' },
    });
    return configs.map((config) => this.mapToResponse(config));
  }

  async findOne(id: string): Promise<WebhookResponseDto> {
    const config = await this.prisma.webhookConfigs.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Webhook con ID ${id} no encontrado`);
    }

    return this.mapToResponse(config);
  }

  async create(dto: CreateWebhookDto): Promise<WebhookSecretResponseDto> {
    const secreto = this.generateSecret();

    const config = await this.prisma.webhookConfigs.create({
      data: {
        nombre: dto.nombre,
        url: dto.url,
        eventos: dto.eventos,
        emisorId: dto.emisorId,
        secreto,
        reintentosMax: dto.reintentosMax || 3,
      },
    });

    this.logger.log(`Webhook creado: ${dto.nombre} -> ${dto.url}`);
    return this.mapToSecretResponse(config);
  }

  async update(id: string, dto: UpdateWebhookDto): Promise<WebhookResponseDto> {
    await this.findOne(id);

    const config = await this.prisma.webhookConfigs.update({
      where: { id },
      data: {
        nombre: dto.nombre !== undefined ? dto.nombre : undefined,
        url: dto.url !== undefined ? dto.url : undefined,
        eventos: dto.eventos !== undefined ? dto.eventos : undefined,
        activo: dto.activo !== undefined ? dto.activo : undefined,
        reintentosMax:
          dto.reintentosMax !== undefined ? dto.reintentosMax : undefined,
      },
    });

    this.logger.log(`Webhook actualizado: ${id}`);
    return this.mapToResponse(config);
  }

  async delete(id: string): Promise<WebhookResponseDto> {
    const webhook = await this.findOne(id);

    if (!webhook.activo) {
      throw new BadRequestException('El webhook ya se encuentra inactivo');
    }

    const config = await this.prisma.webhookConfigs.update({
      where: { id },
      data: { activo: false },
    });

    this.logger.log(`Webhook inactivado: ${id}`);
    return this.mapToResponse(config);
  }

  async regenerateSecret(id: string): Promise<WebhookSecretResponseDto> {
    await this.findOne(id);
    const newSecret = this.generateSecret();

    const config = await this.prisma.webhookConfigs.update({
      where: { id },
      data: { secreto: newSecret },
    });

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

    const [total, logs] = await Promise.all([
      this.prisma.webhookLogs.count({
        where: { configId: id },
      }),
      this.prisma.webhookLogs.findMany({
        where: { configId: id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs.map((row: any) => this.mapLogToResponse(row)),
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
    const configs = await this.prisma.webhookConfigs.findMany({
      where: {
        activo: true,
        eventos: {
          has: evento,
        },
        ...(emisorId ? { emisorId } : {}),
      },
    });

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

  private mapToResponse(row: any): WebhookResponseDto {
    return {
      id: row.id,
      nombre: row.nombre,
      url: row.url,
      eventos: row.eventos,
      emisorId: row.emisorId,
      activo: row.activo,
      reintentosMax: row.reintentosMax,
      createdAt: row.createdAt?.toISOString(),
      updatedAt: row.updatedAt?.toISOString(),
    };
  }

  private mapToSecretResponse(row: any): WebhookSecretResponseDto {
    return {
      ...this.mapToResponse(row),
      secreto: row.secreto,
    };
  }

  private mapLogToResponse(row: any): WebhookLogResponseDto {
    return {
      id: row.id,
      evento: row.evento,
      payload: row.payload,
      statusCode: row.statusCode,
      respuesta: row.respuesta,
      intento: row.intento,
      exitoso: row.exitoso,
      error: row.error,
      tiempoRespuestaMs: row.tiempoRespuestaMs,
      createdAt: row.createdAt?.toISOString(),
    };
  }
}
