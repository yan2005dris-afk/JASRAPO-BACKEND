import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from '../../../../shared/domain/exceptions/domain.exception';
import {
  WebhookRepository,
  WebhookConfigRecord,
  WebhookLogRecord,
  CreateWebhookInput,
  UpdateWebhookInput,
} from '../../domain/repositories/webhook.repository';

@Injectable()
export class PrismaWebhookRepository extends WebhookRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(emisorId?: number): Promise<WebhookConfigRecord[]> {
    const configs = await this.prisma.webhookConfigs.findMany({
      where: emisorId ? { emisorId } : {},
      orderBy: { createdAt: 'desc' },
    });
    return configs.map((c) => this.mapConfig(c));
  }

  async findById(id: string): Promise<WebhookConfigRecord | null> {
    const config = await this.prisma.webhookConfigs.findUnique({
      where: { id },
    });
    return config ? this.mapConfig(config) : null;
  }

  async findActiveByEvent(
    evento: string,
    emisorId?: number,
  ): Promise<WebhookConfigRecord[]> {
    const configs = await this.prisma.webhookConfigs.findMany({
      where: {
        activo: true,
        eventos: {
          has: evento,
        },
        ...(emisorId ? { emisorId } : {}),
      },
    });
    return configs.map((c) => this.mapConfig(c));
  }

  async create(data: CreateWebhookInput): Promise<WebhookConfigRecord> {
    try {
      const config = await this.prisma.webhookConfigs.create({
        data: {
          nombre: data.nombre,
          url: data.url,
          eventos: data.eventos,
          emisorId: data.emisorId,
          secreto: data.secreto,
          reintentosMax: data.reintentosMax || 3,
        },
      });
      return this.mapConfig(config);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new EntityAlreadyExistsException('Webhook', 'URL', data.url);
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    data: UpdateWebhookInput,
  ): Promise<WebhookConfigRecord> {
    try {
      const config = await this.prisma.webhookConfigs.update({
        where: { id },
        data: {
          nombre: data.nombre !== undefined ? data.nombre : undefined,
          url: data.url !== undefined ? data.url : undefined,
          eventos: data.eventos !== undefined ? data.eventos : undefined,
          activo: data.activo !== undefined ? data.activo : undefined,
          reintentosMax:
            data.reintentosMax !== undefined ? data.reintentosMax : undefined,
          secreto: data.secreto !== undefined ? data.secreto : undefined,
        },
      });
      return this.mapConfig(config);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new EntityNotFoundException('Webhook', id);
        }
      }
      throw error;
    }
  }

  async findLogs(
    configId: string,
    limit: number,
    offset: number,
  ): Promise<[number, WebhookLogRecord[]]> {
    const [total, logs] = await Promise.all([
      this.prisma.webhookLogs.count({
        where: { configId },
      }),
      this.prisma.webhookLogs.findMany({
        where: { configId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);
    return [total, logs.map((l) => this.mapLog(l))];
  }

  private mapConfig(row: any): WebhookConfigRecord {
    return {
      id: row.id,
      nombre: row.nombre,
      url: row.url,
      eventos: row.eventos,
      emisorId: row.emisorId,
      secreto: row.secreto,
      activo: row.activo,
      reintentosMax: row.reintentosMax,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapLog(row: any): WebhookLogRecord {
    return {
      id: row.id,
      configId: row.configId,
      evento: row.evento,
      payload: row.payload,
      statusCode: row.statusCode,
      respuesta: row.respuesta,
      intento: row.intento,
      exitoso: row.exitoso,
      error: row.error,
      tiempoRespuestaMs: row.tiempoRespuestaMs,
      createdAt: row.createdAt,
    };
  }
}
