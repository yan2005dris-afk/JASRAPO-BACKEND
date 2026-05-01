import { Controller, Get, HttpCode, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { MetricsService } from './metrics.service';

/**
 * Controlador de métricas para Prometheus
 * Expone endpoint de scrapeo de métricas en formato Prometheus
 */
@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Endpoint de métricas para Prometheus
   * Formato: Prometheus text exposition format
   * Used by: Prometheus scrape
   */
  @ApiOperation({
    summary: 'Métricas Prometheus',
    description:
      'Endpoint de scrapeo de métricas para Prometheus. Retorna todas las métricas de la aplicación en formato Prometheus text exposition.',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas en formato Prometheus',
    content: {
      'text/plain': {
        example: `# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/users",status="200"} 42`,
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Error al generar métricas' })
  @Get()
  @HttpCode(200)
  async getMetrics(@Res() res: Response): Promise<void> {
    const metrics = await this.metricsService.getMetrics();
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
  }
}
