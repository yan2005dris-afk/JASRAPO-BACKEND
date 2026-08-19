import { Injectable, Logger, OnModuleInit, Inject, Optional } from '@nestjs/common';
import { SriService } from './sri.service';

export const SRI_RECONCILIATION_JOB = 'sri-reconciliation-job';

export interface ISriReconciliationScheduler {
  schedule(name: string, cron: string, data?: object, options?: any): Promise<any>;
  work(name: string, handler: (jobs: any[]) => Promise<any>): Promise<any>;
}

@Injectable()
export class SriReconciliationService implements OnModuleInit {
  private readonly logger = new Logger(SriReconciliationService.name);

  constructor(
    private readonly sriService: SriService,
    @Optional() @Inject('JobService') private readonly jobsService?: ISriReconciliationScheduler,
  ) {}

  async onModuleInit() {
    // Schedule periodic reconciliation every 15 minutes via PgBoss
    if (this.jobsService && typeof this.jobsService.schedule === 'function') {
      try {
        await this.jobsService.schedule(
          SRI_RECONCILIATION_JOB,
          '*/15 * * * *', // Every 15 minutes
          {},
          { singletonKey: SRI_RECONCILIATION_JOB },
        );

        await this.jobsService.work(
          SRI_RECONCILIATION_JOB,
          async () => {
            await this.reconcilePendingComprobantes();
          },
        );

        this.logger.log('Job programado de reconciliación SRI registrado (cada 15 minutos)');
      } catch (err: any) {
        this.logger.warn(`No se pudo programar el job de reconciliación en PgBoss: ${err?.message || err}`);
      }
    }
  }

  /**
   * Ejecuta la reconciliación periódica de comprobantes pendientes / en proceso / firmados
   */
  async reconcilePendingComprobantes(): Promise<any> {
    this.logger.log('Iniciando reconciliación automática de comprobantes con el SRI...');
    try {
      const result = await this.sriService.sincronizarConSri({
        estados: ['PENDIENTE', 'EN_PROCESO', 'FIRMADO', 'DEVUELTA'],
        reintentar: true,
        limite: 50,
      });

      this.logger.log(
        `Reconciliación completada: ${result.procesados} procesados, ${result.actualizados} actualizados, ${result.reintentados} reintentados, ${result.errores} errores.`,
      );
      return result;
    } catch (err: any) {
      this.logger.error(`Error durante la reconciliación automática SRI: ${err.message}`, err.stack);
      throw err;
    }
  }
}
