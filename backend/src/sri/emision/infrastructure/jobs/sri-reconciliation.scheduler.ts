import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsService } from '../../../../infrastructure/jobs/jobs.service';
import { LoggerService } from '../../../../infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { SriService } from '../../application/services/sri.service';

/** Nombre de la cola/job pg-boss que dispara la reconciliación periódica. */
export const SRI_RECONCILIATION_JOB = 'sri-reconciliation';

/** Estados que quedan "atascados" cuando la comunicación con el SRI falla. */
const ESTADOS_A_RECONCILIAR = ['PENDIENTE', 'EN_PROCESO', 'DEVUELTA'];

/**
 * Dispara periódicamente `SriService.sincronizarConSri` para recuperar
 * comprobantes que quedaron en PENDIENTE/EN_PROCESO/DEVUELTA tras un fallo
 * de comunicación con el SRI (issue #188). Antes de esto, la única forma de
 * recuperarlos era que un operador llamara manualmente a
 * `POST /sri/sincronizar`.
 *
 * Se implementa como un job recurrente de pg-boss (`schedule()` +
 * `work()`), reutilizando el mismo motor de colas que el resto del backend
 * en lugar de sumar `@nestjs/schedule` como dependencia nueva:
 * `jobs.schedule` ya es una tabla nativa de pg-boss (ver
 * `src/infrastructure/jobs/README.md`) y `JobsService` es un singleton
 * global disponible en toda la app.
 */
@LogContext()
@Injectable()
export class SriReconciliationScheduler implements OnModuleInit {
  constructor(
    private readonly jobsService: JobsService,
    private readonly sriService: SriService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    const intervalMinutes = this.getIntervalMinutes();
    const cron = `*/${intervalMinutes} * * * *`;

    await this.jobsService.schedule(SRI_RECONCILIATION_JOB, cron, {});

    await this.jobsService.work(SRI_RECONCILIATION_JOB, async ([job]) => {
      if (job) {
        await this.reconciliar();
      }
    });

    this.logger.log(
      `Reconciliación automática con SRI programada cada ${intervalMinutes} min (job: ${SRI_RECONCILIATION_JOB})`,
    );
  }

  /**
   * Ejecuta una pasada de reconciliación. Expuesto también como método
   * público (no solo vía el handler de pg-boss) para poder invocarlo desde
   * tests sin pasar por el ciclo de vida completo del job.
   */
  async reconciliar(): Promise<void> {
    const staleMinutes = this.getStaleMinutes();
    const reintentar = this.getReintentar();
    const fechaHasta = new Date(
      Date.now() - staleMinutes * 60 * 1000,
    ).toISOString();

    this.logger.log(
      `Iniciando reconciliación automática de comprobantes con SRI ` +
        `(estados: ${ESTADOS_A_RECONCILIAR.join(', ')}, antigüedad mínima: ${staleMinutes} min, reintentar: ${reintentar})`,
    );

    try {
      const resultado = await this.sriService.sincronizarConSri({
        estados: ESTADOS_A_RECONCILIAR,
        fechaHasta,
        reintentar,
      });

      this.logger.log(
        `Reconciliación automática con SRI completada: ${resultado.procesados} procesados, ` +
          `${resultado.actualizados} actualizados, ${resultado.reintentados} reintentados, ${resultado.errores} errores`,
      );
    } catch (error) {
      this.logger.warn(
        `Error en reconciliación automática con SRI: ${(error as Error).message}`,
      );
    }
  }

  private getIntervalMinutes(): number {
    const value = this.configService.get<number>(
      'SRI_RECONCILIATION_INTERVAL_MINUTES',
      15,
    );
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 15;
  }

  private getStaleMinutes(): number {
    const value = this.configService.get<number>(
      'SRI_RECONCILIATION_STALE_MINUTES',
      15,
    );
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 15;
  }

  private getReintentar(): boolean {
    return (
      this.configService.get<string>('SRI_RECONCILIATION_REINTENTAR') !==
      'false'
    );
  }
}
