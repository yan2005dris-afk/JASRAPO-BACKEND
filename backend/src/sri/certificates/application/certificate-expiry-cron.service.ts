import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmisorRepository } from '../../emisores/domain/repositories/emisor.repository';
import { MailService } from '../../../infrastructure/mail/application/mail.service';
import { JobsService } from '../../../infrastructure/jobs/jobs.service';

export const CERTIFICATE_EXPIRY_CHECK_JOB = 'check-certificate-expiry';
export const DEFAULT_CERT_WARNING_DAYS = 30;
export const DEFAULT_CHECK_CRON = '0 8 * * *'; // Everyday at 8:00 AM

export interface ExpiryCheckSummary {
  totalEmisores: number;
  totalWithCertificates: number;
  expiringSoon: number;
  expired: number;
  alertsSent: number;
}

@Injectable()
export class CertificateExpiryCronService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(CertificateExpiryCronService.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly emisorRepository: EmisorRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @Optional() private readonly jobsService?: JobsService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const cronSchedule = this.configService.get<string>(
      'CERTIFICATE_EXPIRY_CRON',
      DEFAULT_CHECK_CRON,
    );

    if (this.jobsService) {
      try {
        await this.jobsService.work(CERTIFICATE_EXPIRY_CHECK_JOB, async () => {
          await this.checkExpiringCertificates();
        });

        await this.jobsService.schedule(
          CERTIFICATE_EXPIRY_CHECK_JOB,
          cronSchedule,
        );

        this.logger.log(
          `Certificate expiry check job scheduled with pg-boss cron "${cronSchedule}"`,
        );
        return;
      } catch (error) {
        this.logger.warn(
          `Failed to schedule certificate expiry check job via pg-boss, falling back to setInterval: ${(error as Error).message}`,
        );
      }
    }

    // Fallback interval check if pg-boss scheduler is disabled/unavailable
    const checkIntervalMs =
      this.configService.get<number>(
        'CERTIFICATE_EXPIRY_CHECK_INTERVAL_MS',
        24 * 60 * 60 * 1000,
      );

    this.checkExpiringCertificates().catch((err) =>
      this.logger.error('Initial certificate expiry check failed', err),
    );

    this.timer = setInterval(() => {
      this.checkExpiringCertificates().catch((err) =>
        this.logger.error('Scheduled certificate expiry check failed', err),
      );
    }, checkIntervalMs);

    this.logger.log(
      `Certificate expiry check fallback timer active (every ${checkIntervalMs / 1000 / 60}m)`,
    );
  }

  onApplicationShutdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async checkExpiringCertificates(): Promise<ExpiryCheckSummary> {
    this.logger.log('Starting proactive P12 certificate expiry check...');

    const alertEmailRecipient =
      this.configService.get<string>('CERTIFICATE_ALERT_EMAIL') ||
      this.configService.get<string>('EMAIL_ADMIN') ||
      'admin@jasrapo.com';

    const warningThresholdDays = Math.max(
      1,
      this.configService.get<number>(
        'CERTIFICATE_WARNING_DAYS',
        DEFAULT_CERT_WARNING_DAYS,
      ),
    );

    const emisores = await this.emisorRepository.findAll();
    const activeEmisores = emisores.filter(
      (e) => e.estado?.toUpperCase() === 'ACTIVO',
    );

    const summary: ExpiryCheckSummary = {
      totalEmisores: activeEmisores.length,
      totalWithCertificates: 0,
      expiringSoon: 0,
      expired: 0,
      alertsSent: 0,
    };

    const now = new Date();

    for (const emisor of activeEmisores) {
      if (!emisor.certificado_valido_hasta) {
        continue;
      }

      summary.totalWithCertificates++;

      const expiryDate = new Date(emisor.certificado_valido_hasta);
      const diffMs = expiryDate.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isExpired = daysUntilExpiry <= 0;

      if (isExpired) {
        summary.expired++;
        this.logger.error(
          `Certificate for emisor RUC ${emisor.ruc} (${emisor.razon_social}) IS EXPIRED on ${expiryDate.toISOString()}`,
        );
      } else if (daysUntilExpiry <= warningThresholdDays) {
        summary.expiringSoon++;
        this.logger.warn(
          `Certificate for emisor RUC ${emisor.ruc} (${emisor.razon_social}) expires in ${daysUntilExpiry} days (threshold: ${warningThresholdDays}d)`,
        );
      } else {
        continue; // Certificate is healthy
      }

      try {
        await this.mailService.sendCertificateExpiryAlert(
          alertEmailRecipient,
          {
            ruc: emisor.ruc,
            razonSocial: emisor.razon_social,
            certificadoSujeto: emisor.certificado_sujeto || 'No especificado',
            fechaExpiracion: expiryDate.toLocaleDateString('es-EC', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            diasHastaExpiracion: daysUntilExpiry,
            isExpired,
          },
        );
        summary.alertsSent++;
      } catch (alertErr) {
        this.logger.error(
          `Failed to queue certificate expiry alert email for emisor ${emisor.ruc}: ${(alertErr as Error).message}`,
        );
      }
    }

    this.logger.log(
      `Certificate expiry check completed: ${summary.alertsSent} alerts sent (${summary.expired} expired, ${summary.expiringSoon} expiring soon out of ${summary.totalWithCertificates} active certs)`,
    );

    return summary;
  }
}
