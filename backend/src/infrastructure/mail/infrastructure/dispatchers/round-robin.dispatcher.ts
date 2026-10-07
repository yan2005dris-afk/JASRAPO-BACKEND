import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { MailProviderConfig } from '../../domain/config/mail-provider-config.interface';
import type {
  MailDispatcher,
  MailResult,
} from '../../domain/interfaces/mail-provider.interface';
import { MailRateLimitService } from '../rate-limit/mail-rate-limit.service';

const COOLDOWN_MS = 60_000; // 60 seconds

interface ProviderState {
  inactiveUntil: number; // 0 = active, >0 = timestamp until which provider is inactive
}

/**
 * RoundRobinDispatcher distributes sends evenly across all enabled providers.
 * Maintains an atomic counter and supports cooldown on failure.
 */
@Injectable()
export class RoundRobinDispatcher implements MailDispatcher {
  private readonly logger = new Logger(RoundRobinDispatcher.name);
  private readonly transporters = new Map<string, nodemailer.Transporter>();
  private readonly providerStates = new Map<string, ProviderState>();
  private index = 0;

  constructor(private readonly rateLimitService: MailRateLimitService) {}

  async send(
    mailOptions: nodemailer.SendMailOptions,
    providers: MailProviderConfig[],
  ): Promise<MailResult> {
    const enabled = providers.filter((p) => p.enabled);
    if (enabled.length === 0) {
      return {
        messageId: '',
        success: false,
        error: 'No mail providers configured',
      };
    }

    // Try providers in round-robin order, starting from current index
    const now = Date.now();
    const startIndex = this.index;

    for (let attempt = 0; attempt < enabled.length; attempt++) {
      const idx = (startIndex + attempt) % enabled.length;
      const provider = enabled[idx];

      // Skip if provider is in cooldown
      const state = this.providerStates.get(provider.name);
      if (state && state.inactiveUntil > now) {
        this.logger.debug(
          `${provider.name} is in cooldown (${Math.ceil((state.inactiveUntil - now) / 1000)}s remaining), skipping`,
        );
        continue;
      }

      // Check rate limit
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

        // Advance index only on successful send
        this.index = (idx + 1) % enabled.length;

        return {
          messageId: info.messageId ?? '',
          success: true,
        };
      } catch (error: unknown) {
        await this.rateLimitService.release(provider.name);
        const message =
          error instanceof Error ? error.message : 'Unknown provider error';
        this.logger.warn(`${provider.name} failed: ${message}`);

        // Mark as inactive with cooldown
        this.providerStates.set(provider.name, {
          inactiveUntil: now + COOLDOWN_MS,
        });
        this.logger.warn(`${provider.name} marked inactive for 60s cooldown`);
      }

      // Advance index after this attempt
      this.index = (idx + 1) % enabled.length;
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
