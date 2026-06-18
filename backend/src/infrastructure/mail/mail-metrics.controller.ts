import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';

@ApiTags('[Posible Implementación] Monitoreo de Correos')
@Controller('mail/metrics')
export class MailMetricsController {
  private readonly logger = new Logger(MailMetricsController.name);

  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({
    summary: 'Obtiene métricas de los envíos de correos (Dashboard futuro)',
    description:
      'Endpoint diseñado para alimentar una futura pantalla de monitoreo. Devuelve el estado actual de la cola de pg-boss y el registro de todos los trabajos históricos.',
  })
  @ApiResponse({ status: 200, description: 'Métricas obtenidas correctamente' })
  @ApiResponse({
    status: 503,
    description: 'Métricas no disponibles temporalmente',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Límite de resultados (por defecto 50)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Offset de resultados (por defecto 0)',
  })
  @Get()
  async getMetrics(
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    try {
      const parsedLimit = parseInt(limitStr as string, 10);
      const limit = isNaN(parsedLimit) ? 50 : parsedLimit;
      const parsedOffset = parseInt(offsetStr as string, 10);
      const offset = isNaN(parsedOffset) ? 0 : parsedOffset;
      const rows = await this.prisma.$queryRawUnsafe<
        Array<{ state: string; count: bigint }>
      >(
        `SELECT state, COUNT(*) as count FROM jobs.job WHERE name = 'send-mail' GROUP BY state`,
      );

      const metrics = {
        total: 0,
        created: 0,
        active: 0,
        completed: 0,
        failed: 0,
        retry: 0,
        cancelled: 0,
        expired: 0,
        allJobs: [] as any[],
      };

      for (const row of rows) {
        // Prisma returns count as BigInt, we need to convert it to Number
        const count = Number(row.count);
        const state = row.state as keyof typeof metrics;
        if (state in metrics && state !== 'allJobs') {
          metrics[state] = count;
        }
        metrics.total += count;
      }

      const allRows = await this.prisma.$queryRawUnsafe<
        Array<{
          id: string;
          state: string;
          recipient: string;
          created_at: Date;
        }>
      >(
        `SELECT id, state, data->>'to' as recipient, created_on as created_at FROM jobs.job WHERE name = 'send-mail' ORDER BY created_on DESC LIMIT ${limit} OFFSET ${offset}`,
      );

      metrics.allJobs = allRows;

      return metrics;
    } catch (error) {
      this.logger.error('Error fetching mail metrics', error);
      // Retornamos un objeto vacío en caso de error (ej: si pg-boss no ha creado la tabla aún)
      return { total: 0, error: 'Metrics unavailable' };
    }
  }
}
