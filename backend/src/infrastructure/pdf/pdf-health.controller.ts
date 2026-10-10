import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { PdfHealthService } from './pdf-health.service';

@ApiTags('Health')
@Public()
@Controller('health/pdf')
export class PdfHealthController {
  constructor(private readonly pdfHealth: PdfHealthService) {}

  @Get()
  @ApiOperation({
    summary: 'PDF service health check',
    description:
      'Returns Puppeteer browser status, semaphore utilisation, and render metrics. Useful for monitoring dashboards and Kubernetes liveness probes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved',
    schema: {
      example: {
        status: 'healthy',
        browser: { connected: true, uptimeMs: 300000 },
        semaphore: {
          concurrency: 4,
          maxQueueSize: 32,
          activeSlots: 2,
          availableSlots: 2,
          queueLength: 0,
        },
        metrics: {
          totalRenders: 150,
          totalErrors: 0,
          totalTimeouts: 0,
          totalRejections: 0,
          totalCancellations: 0,
          browserRestarts: 0,
          lastErrorAt: null,
          lastErrorMessage: null,
        },
        timestamp: '2026-07-03T00:00:00.000Z',
      },
    },
  })
  getHealth() {
    return this.pdfHealth.getHealth();
  }
}
