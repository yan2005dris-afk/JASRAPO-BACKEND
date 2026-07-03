import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { PdfService } from './pdf.service';

const PDF_HEARTBEAT_MS = Number(process.env['PDF_HEARTBEAT_MS']) || 30_000;

@Injectable()
export class PdfHealthService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(PdfHealthService.name);
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly pdfService: PdfService) {}

  onApplicationBootstrap(): void {
    this.heartbeatTimer = setInterval(() => {
      this.checkHealth().catch((err) =>
        this.logger.error('Health heartbeat failed', err),
      );
    }, PDF_HEARTBEAT_MS);
    this.logger.log(
      `PDF health heartbeat started (interval: ${PDF_HEARTBEAT_MS}ms)`,
    );
  }

  onApplicationShutdown(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Heartbeat that checks Puppeteer browser health every 30s.
   * If the browser process crashed (OOM, signal, etc.), auto-recovers
   * by nullifying the reference — the next `getBrowser()` call in
   * PdfService will re-launch it.
   */
  private async checkHealth(): Promise<void> {
    const browser = this.pdfService.browser;

    if (!browser || !browser.connected) {
      this.logger.warn(
        'Puppeteer browser is disconnected — will auto-recover on next request',
      );
      // The browser process is gone; nullifying lets getBrowser() re-launch.
      // The previous browser reference was already disconnected, so no
      // explicit close is needed.
      (this.pdfService as unknown as { browser: null }).browser = null;
    }
  }

  /**
   * Returns the current health status from PdfService.
   */
  getHealth() {
    return this.pdfService.getHealthStatus();
  }
}
