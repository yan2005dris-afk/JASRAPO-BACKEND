import { Injectable, OnModuleInit, Inject, Optional } from '@nestjs/common';
import { EmisorRepository } from '../../domain/repositories/emisor.repository';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

export const CERTIFICATE_EXPIRY_CHECK_JOB = 'sri-certificate-expiry-check';

export interface CertificateExpiryAlert {
  emisorId: number;
  ruc: string;
  razonSocial: string;
  certificadoNombre: string;
  validoHasta: Date;
  diasRestantes: number;
  estado: 'EXPIRADO' | 'CRITICO' | 'ADVERTENCIA' | 'VIGENTE';
}

export interface ICertificateJobScheduler {
  schedule(
    name: string,
    cron: string,
    data?: object,
    options?: any,
  ): Promise<any>;
  work(name: string, handler: (jobs: any[]) => Promise<any>): Promise<any>;
}

@LogContext()
@Injectable()
export class CertificateExpiryCheckService implements OnModuleInit {
  constructor(
    private readonly emisorRepository: EmisorRepository,
    private readonly logger: LoggerService,
    @Optional()
    @Inject('JobService')
    private readonly jobsService?: ICertificateJobScheduler,
  ) {}

  async onModuleInit() {
    // Schedule daily check at 08:00 AM via PgBoss if jobsService is available
    if (this.jobsService && typeof this.jobsService.schedule === 'function') {
      try {
        await this.jobsService.schedule(
          CERTIFICATE_EXPIRY_CHECK_JOB,
          '0 8 * * *', // Daily at 8:00 AM
          {},
          { singletonKey: CERTIFICATE_EXPIRY_CHECK_JOB },
        );

        await this.jobsService.work(CERTIFICATE_EXPIRY_CHECK_JOB, async () => {
          await this.checkAllCertificates();
        });

        this.logger.log(
          'Job programado de verificación de certificados SRI registrado (08:00 AM diario)',
        );
      } catch (err: any) {
        this.logger.warn(
          `No se pudo programar el job en PgBoss: ${err?.message || err}`,
        );
      }
    }
  }

  /**
   * Recorre todos los emisores y detecta certificados vencidos o próximos a vencer (≤ 30 días)
   */
  async checkAllCertificates(): Promise<CertificateExpiryAlert[]> {
    const emisores = await this.emisorRepository.findAll();
    const now = new Date();
    const alerts: CertificateExpiryAlert[] = [];

    for (const emisor of emisores) {
      if (!emisor.certificado_valido_hasta) {
        continue;
      }

      const validoHasta = new Date(emisor.certificado_valido_hasta);
      const diffMs = validoHasta.getTime() - now.getTime();
      const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let estado: CertificateExpiryAlert['estado'] = 'VIGENTE';
      if (diasRestantes <= 0) {
        estado = 'EXPIRADO';
        this.logger.error(
          `[ALERTA SRI] Certificado de ${emisor.razon_social} (RUC ${emisor.ruc}) EXPIRÓ hace ${Math.abs(diasRestantes)} días (Fecha: ${validoHasta.toISOString().split('T')[0]}).`,
        );
      } else if (diasRestantes <= 7) {
        estado = 'CRITICO';
        this.logger.error(
          `[ALERTA SRI] Certificado de ${emisor.razon_social} (RUC ${emisor.ruc}) EXPIRA EN ${diasRestantes} DÍAS (Fecha: ${validoHasta.toISOString().split('T')[0]}). Requiere renovación inmediata.`,
        );
      } else if (diasRestantes <= 30) {
        estado = 'ADVERTENCIA';
        this.logger.warn(
          `[ALERTA SRI] Certificado de ${emisor.razon_social} (RUC ${emisor.ruc}) próximo a expirar en ${diasRestantes} días (Fecha: ${validoHasta.toISOString().split('T')[0]}).`,
        );
      }

      if (estado !== 'VIGENTE') {
        alerts.push({
          emisorId: emisor.id,
          ruc: emisor.ruc,
          razonSocial: emisor.razon_social,
          certificadoNombre: emisor.certificado_nombre || 'desconocido.p12',
          validoHasta,
          diasRestantes,
          estado,
        });
      }
    }

    return alerts;
  }
}
