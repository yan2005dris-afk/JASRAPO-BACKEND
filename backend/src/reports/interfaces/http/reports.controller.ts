import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../../identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from '../../../infrastructure/common/decorators/require-permission.decorator';
import { ClientsListReportFilterDto } from '../dto/clients-list-report-filter.dto';
import { PaymentsReportFilterDto } from '../dto/payments-report-filter.dto';
import { ConnectionHistoryFilterDto } from '../dto/connection-history-filter.dto';
import { AccountStatementFilterDto } from '../dto/account-statement-filter.dto';
import { PaymentAgreementFilterDto } from '../dto/payment-agreement-filter.dto';
import { ReportStyleDispatcher } from '../../application/report-style.dispatcher';
import { SendReportEmailDto } from '../dto/send-report-email.dto';
import { SendClientsListEmailDto } from '../dto/send-clients-list-email.dto';
import { SendReportByEmailUseCase } from '../../application/use-cases/send-report-by-email.use-case';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { observePdfRequestAbort } from 'src/infrastructure/pdf/pdf-request-abort.util';

/**
 * Frontera HTTP de reportes.
 *
 * Cada endpoint obtiene un documento desde su definición tipada. Ese mismo
 * documento se entrega como JSON o se envía al dispatcher para generar el PDF.
 * Los permisos se declaran de forma explícita en cada operación.
 */
import { OverdueAccountsFilterDto } from '../dto/overdue-accounts-filter.dto';
import { ClientsListReportDefinition } from '../../application/definitions/clients-list-report.definition';
import { PaymentsReportDefinition } from '../../application/definitions/payments-report.definition';
import { ConnectionHistoryReportDefinition } from '../../application/definitions/connection-history-report.definition';
import { AccountStatementReportDefinition } from '../../application/definitions/account-statement-report.definition';
import { PaymentAgreementReportDefinition } from '../../application/definitions/payment-agreement-report.definition';
import { OverdueAccountsReportDefinition } from '../../application/definitions/overdue-accounts-report.definition';

@LogContext()
@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly clientsListDefinition: ClientsListReportDefinition,
    private readonly paymentsReportDefinition: PaymentsReportDefinition,
    private readonly connectionHistoryDefinition: ConnectionHistoryReportDefinition,
    private readonly accountStatementDefinition: AccountStatementReportDefinition,
    private readonly overdueAccountsDefinition: OverdueAccountsReportDefinition,
    private readonly paymentAgreementDefinition: PaymentAgreementReportDefinition,
    private readonly dispatcher: ReportStyleDispatcher,
    private readonly sendReportByEmail: SendReportByEmailUseCase,
    private readonly logger: LoggerService,
  ) {}

  // ─── Reportes con salida JSON o PDF ──────────────────────────────────────

  @Get('payments-report')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Abonos (estilo configurable)',
    description:
      'Genera un PDF con los pagos aplicados a facturas, o devuelve el mismo modelo proyectado en JSON según el header `Accept`. El estilo (legacy|modern) se resuelve desde sistema_config (`reporte.estilo`).',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado o JSON con el modelo proyectado según Accept',
    content: {
      'application/pdf': {},
      'application/json': {},
    },
  })
  async paymentsReportPdf(
    @Query() filters: PaymentsReportFilterDto,
    @Res() res: Response,
  ) {
    return this.withPdfRequestAbort(res, async (signal) => {
      this.logger.log(
        `Generating payments-report — filters: ${JSON.stringify(filters)}`,
      );
      const { document } =
        await this.paymentsReportDefinition.generate(filters);
      const { buffer, filename } = await this.dispatcher.dispatch(
        'payments-report',
        document,
        { signal },
      );
      this.respondWithContentNegotiation(res, document, buffer, filename);
    });
  }

  @Get('connection-history')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Historial de Conexión (estilo configurable)',
    description:
      'Genera un PDF con el historial de facturación por período, o devuelve el mismo modelo proyectado en JSON según el header `Accept`. El estilo se resuelve desde sistema_config (`reporte.estilo`).',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado o JSON con el modelo proyectado según Accept',
    content: {
      'application/pdf': {},
      'application/json': {},
    },
  })
  async connectionHistoryPdf(
    @Query() filters: ConnectionHistoryFilterDto,
    @Res() res: Response,
  ) {
    return this.withPdfRequestAbort(res, async (signal) => {
      this.logger.log(
        `Generating connection-history — filters: ${JSON.stringify(filters)}`,
      );
      const { document } =
        await this.connectionHistoryDefinition.generate(filters);
      const { buffer, filename } = await this.dispatcher.dispatch(
        'connection-history',
        document,
        { signal },
      );
      this.respondWithContentNegotiation(res, document, buffer, filename);
    });
  }

  @Get('payment-agreement')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Convenio de Pago (estilo configurable)',
    description:
      'Genera el PDF canónico del convenio de pago, o devuelve el mismo modelo proyectado en JSON según el header `Accept`.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado o JSON con el modelo proyectado según Accept',
    content: {
      'application/pdf': {},
      'application/json': {},
    },
  })
  async paymentAgreementPdf(
    @Query() filters: PaymentAgreementFilterDto,
    @Res() res: Response,
  ) {
    return this.withPdfRequestAbort(res, async (signal) => {
      this.logger.log(
        `Generating payment-agreement — filters: ${JSON.stringify(filters)}`,
      );
      const { document } =
        await this.paymentAgreementDefinition.generate(filters);
      const { buffer, filename } = await this.dispatcher.dispatch(
        'payment-agreement',
        document,
        { signal },
      );
      this.respondWithContentNegotiation(res, document, buffer, filename);
    });
  }

  // ─── Untouched endpoints (REQ-10) ───────────────────────────────────────────

  @Get('clients-list')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Listado de Clientes (estilo configurable)',
    description:
      'Genera un PDF con todos los clientes, o devuelve el mismo modelo proyectado en JSON según el header `Accept`. El estilo (legacy|modern) se resuelve desde sistema_config (`reporte.estilo`).',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado o JSON con el modelo proyectado según Accept',
    content: {
      'application/pdf': {},
      'application/json': {},
    },
  })
  async clientsListPdf(
    @Query() filters: ClientsListReportFilterDto,
    @Res() res: Response,
  ) {
    return this.withPdfRequestAbort(res, async (signal) => {
      this.logger.log(
        `Generating clients-list — filters: ${JSON.stringify(filters)}`,
      );
      const { document } = await this.clientsListDefinition.generate(filters);
      const { buffer, filename } = await this.dispatcher.dispatch(
        'clients-list',
        document,
        { signal },
      );
      this.respondWithContentNegotiation(res, document, buffer, filename);
    });
  }

  @Get('account-statement')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Estado de Cuenta (estilo configurable)',
    description:
      'Genera un PDF con el estado de cuenta de un contrato, o devuelve el mismo modelo proyectado en JSON según el header `Accept`. El estilo (legacy|modern) se resuelve desde sistema_config (`reporte.estilo`).',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado o JSON con el modelo proyectado según Accept',
    content: {
      'application/pdf': {},
      'application/json': {},
    },
  })
  async accountStatementPdf(
    @Query() filters: AccountStatementFilterDto,
    @Res() res: Response,
  ) {
    return this.withPdfRequestAbort(res, async (signal) => {
      this.logger.log(
        `Generating account-statement — filters: ${JSON.stringify(filters)}`,
      );
      const { document } =
        await this.accountStatementDefinition.generate(filters);
      const { buffer, filename } = await this.dispatcher.dispatch(
        'account-statement',
        document,
        { signal },
      );
      this.respondWithContentNegotiation(res, document, buffer, filename);
    });
  }

  @Get('overdue-accounts')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Recaudación y Morosidad',
    description:
      'Retorna el listado de cuentas con valores pendientes de pago y métricas de morosidad.',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de morosidad en formato JSON',
  })
  async overdueAccounts(@Query() filters: OverdueAccountsFilterDto) {
    this.logger.log(
      `Generating overdue-accounts — filters: ${JSON.stringify(filters)}`,
    );
    const { document } = await this.overdueAccountsDefinition.generate(filters);
    return document;
  }

  // ─── Email send endpoints (report-endpoint-send-email) ───────────────────────

  @Post('payments-report/email')
  @RequiredPermission('reportes', 'read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Reporte de Abonos por email' })
  @ApiBody({ type: SendReportEmailDto })
  @ApiResponse({ status: 400, description: 'Falta clienteId' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  sendPaymentsReportEmail(@Body() body: SendReportEmailDto) {
    if (!body.clienteId) {
      throw new BadRequestException('clienteId es requerido');
    }
    return this.sendReportByEmail.execute({
      reportType: 'payments-report',
      filters: { clienteId: body.clienteId },
      destinatarioOverride: body.destinatario,
      subjectOverride: body.subject,
      idempotencyKey: body.idempotencyKey,
    });
  }

  @Post('connection-history/email')
  @RequiredPermission('reportes', 'read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Historial de Conexión por email' })
  @ApiBody({ type: SendReportEmailDto })
  @ApiResponse({ status: 400, description: 'Falta contratoId' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  sendConnectionHistoryEmail(@Body() body: SendReportEmailDto) {
    if (!body.contratoId) {
      throw new BadRequestException('contratoId es requerido');
    }
    return this.sendReportByEmail.execute({
      reportType: 'connection-history',
      filters: { contratoId: body.contratoId },
      destinatarioOverride: body.destinatario,
      subjectOverride: body.subject,
      idempotencyKey: body.idempotencyKey,
    });
  }

  @Post('payment-agreement/email')
  @RequiredPermission('reportes', 'read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Convenio de Pago por email' })
  @ApiBody({ type: SendReportEmailDto })
  @ApiResponse({ status: 400, description: 'Falta convenioId' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  sendPaymentAgreementEmail(@Body() body: SendReportEmailDto) {
    if (!body.convenioId) {
      throw new BadRequestException('convenioId es requerido');
    }
    return this.sendReportByEmail.execute({
      reportType: 'payment-agreement',
      filters: { convenioId: body.convenioId },
      destinatarioOverride: body.destinatario,
      subjectOverride: body.subject,
      idempotencyKey: body.idempotencyKey,
    });
  }

  @Post('account-statement/email')
  @RequiredPermission('reportes', 'read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Estado de Cuenta por email' })
  @ApiBody({ type: SendReportEmailDto })
  @ApiResponse({ status: 400, description: 'Falta contratoId' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  sendAccountStatementEmail(@Body() body: SendReportEmailDto) {
    if (!body.contratoId) {
      throw new BadRequestException('contratoId es requerido');
    }
    return this.sendReportByEmail.execute({
      reportType: 'account-statement',
      filters: { contratoId: body.contratoId },
      destinatarioOverride: body.destinatario,
      subjectOverride: body.subject,
      idempotencyKey: body.idempotencyKey,
    });
  }

  @Post('clients/email')
  @RequiredPermission('reportes', 'read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Listado de Clientes por email' })
  @ApiBody({ type: SendClientsListEmailDto })
  @ApiResponse({ status: 400, description: 'Falta destinatario' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  sendClientsListEmail(@Body() body: SendClientsListEmailDto) {
    if (!body.destinatario) {
      throw new BadRequestException(
        'destinatario es obligatorio para el listado de clientes',
      );
    }
    return this.sendReportByEmail.execute({
      reportType: 'clients-list',
      filters: body.filtros ?? {},
      destinatarioOverride: body.destinatario,
      subjectOverride: body.subject,
      idempotencyKey: body.idempotencyKey,
    });
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async withPdfRequestAbort<T>(
    res: Response,
    operation: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const requestAbort = observePdfRequestAbort(res);
    try {
      return await operation(requestAbort.signal);
    } finally {
      requestAbort.dispose();
    }
  }

  /**
   * Responde con PDF solo cuando el cliente lo solicita de forma explícita.
   * Para cualquier otro valor de `Accept`, devuelve el documento proyectado
   * como JSON y convierte los valores BigInt de manera segura.
   */
  private respondWithContentNegotiation(
    res: Response,
    data: object,
    buffer: Buffer,
    pdfFilename: string,
  ): void {
    const accept = (res.req.headers.accept ?? '').toLowerCase();
    // El PDF es opcional: todos los tipos aceptados deben ser application/pdf.
    const acceptedTypes = accept
      .split(',')
      .map((s) => s.trim().split(';')[0].trim())
      .filter(Boolean);
    const wantsPdf =
      acceptedTypes.length > 0 &&
      acceptedTypes.every((t) => t === 'application/pdf');

    if (!wantsPdf) {
      const jsonFilename = pdfFilename.replace(/\.pdf$/i, '.json');
      res.set({
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `inline; filename="${jsonFilename}"`,
      });
      // @Res() evita el interceptor global, por eso se convierten los BigInt aquí.
      const safeJson = JSON.stringify(data, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      );
      res.send(safeJson);
      return;
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${pdfFilename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
