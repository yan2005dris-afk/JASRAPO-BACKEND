import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { MailProviderConfig } from '../../domain/config/mail-provider-config.interface';
import type {
  MailDispatcher,
  MailResult,
} from '../../domain/interfaces/mail-provider.interface';
import { MailRateLimitService } from '../rate-limit/mail-rate-limit.service';

/**
 * FailoverDispatcher implements the failover strategy:
 * tries providers in priority order, falling back to the next on failure.
 * This matches the original MailProviderFactory inline behavior.
 */
@Injectable()
export class FailoverDispatcher implements MailDispatcher {
  private readonly logger = new Logger(FailoverDispatcher.name);
  private readonly transporters = new Map<string, nodemailer.Transporter>();

  constructor(private readonly rateLimitService: MailRateLimitService) {}

  async send(
    mailOptions: nodemailer.SendMailOptions,
    providers: MailProviderConfig[],
  ): Promise<MailResult> {
    const sorted = [...providers]
      .filter((p) => p.enabled)
      .sort((a, b) => a.priority - b.priority);

    if (sorted.length === 0) {
      return {
        messageId: '',
        success: false,
        error: 'No mail providers configured',
      };
    }

    for (const provider of sorted) {
      const acquired = await this.rateLimitService.tryAcquire(
        provider.name,
        provider.rateLimit.maxPerDay,
      );

      if (!acquired) {
        this.logger.warn(
          `${provider.name} reached daily limit, trying next provider`,
        );
        continue;
      }

      try {
        const transporter = this.getTransporter(provider);
        const info = await transporter.sendMail(mailOptions);
        this.logger.log(`Email sent via ${provider.name}`);
        return {
          messageId: info.messageId ?? '',
          success: true,
        };
      } catch (error: unknown) {
        await this.rateLimitService.release(provider.name);
        const message =
          error instanceof Error ? error.message : 'Unknown provider error';
        this.logger.warn(`${provider.name} failed: ${message}`);
      }
    }

    return {
      messageId: '',
      success: false,
      error: 'All mail providers failed',
    };
  }

  private getTransporter(provider: MailProviderConfig): nodemailer.Transporter {
    let transporter = this.transporters.get(provider.name);
    if (!transporter) {
      transporter = nodemailer.createTransport({
        connectionTimeout: 10000,
        socketTimeout: 15000,
        greetingTimeout: 5000,
        ...provider.transport,
      });
      this.transporters.set(provider.name, transporter);
    }
    return transporter;
  }
}
