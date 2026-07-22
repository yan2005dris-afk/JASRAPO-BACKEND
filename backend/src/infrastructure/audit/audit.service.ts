import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { LoggerService } from '../observability/logger/logger.service';
import { redactEmail, redactIp } from '../observability/redact';

export interface AuditEntry {
  usuarioId?: number;
  usuarioEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  accion: string;
  recurso: string;
  recursoId?: string;
  descripcion?: string;
  datosAnteriores?: Record<string, any>;
  datosNuevos?: Record<string, any>;
  metadata?: Record<string, any>;
  exitoso?: boolean;
  error?: string;
  duracionMs?: number;
}

export const AUDIT_RETRY_JOB = 'audit-write';

const AUDIT_RETRY_LIMIT = 5;
const AUDIT_RETRY_DELAY_SECONDS = 30;

/**
 * AuditService - Registro transversal de actividades del sistema.
 * Reubicado en infraestructura para ser compartido por todos los contextos.
 *
 * Durabilidad (#147): cuando `auditoriaSri.create` falla (ej. blip de DB
 * durante un ataque, el momento exacto donde la auditoría más importa),
 * el evento se encola en pg-boss (JobsService) con backoff exponencial.
 * Si se agotan los reintentos, el worker emite el evento
 * `audit.durability.exhausted` a través de LoggerService para alertar.
 */
@Injectable()
export class AuditService implements OnModuleInit {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
    private readonly loggerService: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.jobsService.workWithMetadata<AuditEntry>(
      AUDIT_RETRY_JOB,
      async ([job]) => {
        if (!job) return;
        try {
          await this.writeAudit(job.data);
        } catch (error) {
          const lastError = (error as Error)?.message ?? String(error);
          if (job.retryCount >= job.retryLimit) {
            this.loggerService.error(
              `audit.durability.exhausted action=${job.data?.accion} recurso=${job.data?.recurso} lastError=${lastError}`,
              JSON.stringify({
                payload: job.data,
                lastError,
                retryCount: job.retryCount,
                retryLimit: job.retryLimit,
              }),
              'AuditService',
            );
          }
          throw error;
        }
      },
    );
  }

  /**
   * Registra un evento de auditoría en la base de datos.
   * Fire-and-forget por defecto: nunca propaga errores al caller.
   * En caso de fallo de escritura, encola un job de reintento durable.
   *
   * PII fields (email, IP) are redacted at the write boundary inside
   * `writeAudit()` so that neither the database nor downstream replicas
   * store raw personal data. See docs/observability/loki-rbac.md for
   * the full data-minimization policy.
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.writeAudit(entry);
    } catch (error) {
      const message = (error as Error)?.message ?? String(error);
      this.logger.error(
        `Error al registrar auditoría [${entry.accion}/${entry.recurso}]: ${message}`,
      );
      try {
        await this.jobsService.send(AUDIT_RETRY_JOB, entry, {
          retryLimit: AUDIT_RETRY_LIMIT,
          retryDelay: AUDIT_RETRY_DELAY_SECONDS,
          retryBackoff: true,
        });
      } catch (enqueueError) {
        this.logger.error(
          `No se pudo encolar reintento de auditoría [${entry.accion}/${entry.recurso}]: ${(enqueueError as Error)?.message ?? String(enqueueError)}`,
        );
      }
    }
  }

  private async writeAudit(entry: AuditEntry): Promise<void> {
    await this.prisma.auditoriaSri.create({
      data: {
        usuarioId: entry.usuarioId || null,
        usuarioEmail: entry.usuarioEmail
          ? redactEmail(entry.usuarioEmail)
          : null,
        ipAddress: entry.ipAddress ? redactIp(entry.ipAddress) : null,
        userAgent: entry.userAgent || null,
        accion: entry.accion,
        recurso: entry.recurso,
        recursoId: entry.recursoId || null,
        descripcion: entry.descripcion || null,
        datosAnteriores: entry.datosAnteriores || undefined,
        datosNuevos: entry.datosNuevos || undefined,
        metadata: entry.metadata || undefined,
        exitoso: entry.exitoso ?? true,
        error: entry.error || null,
        duracionMs: entry.duracionMs ?? null,
      },
    });
  }

  /**
   * Buscar registros de auditoría con filtros
   */
  async search(_filters: any) {
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
}
