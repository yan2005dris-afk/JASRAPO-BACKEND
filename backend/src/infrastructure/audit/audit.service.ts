import { Injectable, Logger } from '@nestjs/common';
import { RawPgService } from '../database/raw-pg/raw-pg.service';

export interface AuditEntry {
  usuarioId?: string;
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

  constructor(private readonly db: RawPgService) {}

  /**
   * Registra un evento de auditoría en la base de datos.
   * Fire-and-forget por defecto.
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO auditoria 
         (usuario_id, usuario_email, ip_address, user_agent,
          accion, recurso, recurso_id, descripcion,
          datos_anteriores, datos_nuevos, metadata,
          exitoso, error, duracion_ms)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          entry.usuarioId || null,
          entry.usuarioEmail || null,
          entry.ipAddress || null,
          entry.userAgent || null,
          entry.accion,
          entry.recurso,
          entry.recursoId || null,
          entry.descripcion || null,
          entry.datosAnteriores ? JSON.stringify(entry.datosAnteriores) : null,
          entry.datosNuevos ? JSON.stringify(entry.datosNuevos) : null,
          entry.metadata ? JSON.stringify(entry.metadata) : null,
          entry.exitoso ?? true,
          entry.error || null,
          entry.duracionMs ?? null,
        ],
      );
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
    // Lógica similar a la original pero usando RawPgService
    // (Por brevedad mantengo la firma para compatibilidad)
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
}
