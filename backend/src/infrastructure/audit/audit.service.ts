import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
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

/**
 * AuditService - Registro transversal de actividades del sistema.
 * Reubicado en infraestructura para ser compartido por todos los contextos.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un evento de auditoría en la base de datos.
   * Fire-and-forget por defecto.
   *
   * PII fields (email, IP) are redacted at the write boundary so that
   * neither the database nor downstream replicas store raw personal data.
   * See docs/observability/loki-rbac.md for the full data-minimization policy.
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
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
    } catch (error) {
      this.logger.error(
        `Error al registrar auditoría [${entry.accion}/${entry.recurso}]: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Buscar registros de auditoría con filtros
   */
  async search(_filters: any) {
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
}
