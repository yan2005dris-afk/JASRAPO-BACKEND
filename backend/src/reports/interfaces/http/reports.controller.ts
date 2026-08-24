import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
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
import type { JwtPayload } from '../../../identity/auth/application/types/jwt.types';
import { JwtAuthGuard } from '../../../identity/auth/interfaces/http/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/auth/interfaces/http/decorators/current-user.decorator';
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
import { OverdueAccountsFilterDto } from '../dto/overdue-accounts-filter.dto';
import { ClientsListReportDefinition } from '../../application/definitions/clients-list-report.definition';
import { PaymentsReportDefinition } from '../../application/definitions/payments-report.definition';
import { ConnectionHistoryReportDefinition } from '../../application/definitions/connection-history-report.definition';
import { AccountStatementReportDefinition } from '../../application/definitions/account-statement-report.definition';
import { PaymentAgreementReportDefinition } from '../../application/definitions/payment-agreement-report.definition';
import { OverdueAccountsReportDefinition } from '../../application/definitions/overdue-accounts-report.definition';
import { ReportRequestContextFactory } from '../../application/report-request-context.factory';
import { ReportRequestContextException } from '../../application/report-request-context.exception';
import type {
  ReportRequestContext,
  ReportType,
} from '../../application/models/report-request-context';
import type {
  ProjectedReport,
  ReportDocument,
} from '../../application/models/report-projection';
import type { ReportKey } from '../../application/report-style.service';
import { buildPdfFileName } from '../../../infrastructure/pdf/utils/pdf-format.utils';

/**
 * Frontera HTTP de reportes.
 *
 * Cada endpoint obtiene un documento desde su definición tipada. Ese mismo
 * documento se entrega como JSON o se envía al dispatcher para generar el PDF.
 * Los permisos se declaran de forma explícita en cada operación.
 */

interface ReportDefinition<
  TFilters extends object,
  TDocument extends ReportDocument,
> {
  generate(
    context: ReportRequestContext<TFilters>,
  ): Promise<ProjectedReport<TDocument>>;
}

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
    private readonly contextFactory: ReportRequestContextFactory,
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
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
    @Res() res: Response,
  ) {
    const context = this.createContext(
      'payments-report',
      actor,
      filters,
      timeZone,
      locale,
    );
    return this.handleNegotiatedReport(
      'payments-report',
      context,
      this.paymentsReportDefinition,
      res,
    );
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
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
    @Res() res: Response,
  ) {
    const context = this.createContext(
      'connection-history',
      actor,
      filters,
      timeZone,
      locale,
    );
    return this.handleNegotiatedReport(
      'connection-history',
      context,
      this.connectionHistoryDefinition,
      res,
    );
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
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
    @Res() res: Response,
  ) {
    const context = this.createContext(
      'payment-agreement',
      actor,
      filters,
      timeZone,
      locale,
    );
    return this.handleNegotiatedReport(
      'payment-agreement',
      context,
      this.paymentAgreementDefinition,
      res,
    );
  }

  // ─── Reportes adicionales ───────────────────────────────────────────────────

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
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
    @Res() res: Response,
  ) {
    const context = this.createContext(
      'clients-list',
      actor,
      filters,
      timeZone,
      locale,
    );
    return this.handleNegotiatedReport(
      'clients-list',
      context,
      this.clientsListDefinition,
      res,
    );
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
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
    @Res() res: Response,
  ) {
    const context = this.createContext(
      'account-statement',
      actor,
      filters,
      timeZone,
      locale,
    );
    return this.handleNegotiatedReport(
      'account-statement',
      context,
      this.accountStatementDefinition,
      res,
    );
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
  async overdueAccounts(
    @Query() filters: OverdueAccountsFilterDto,
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
  ) {
    const context = this.createContext(
      'overdue-accounts',
      actor,
      filters,
      timeZone,
      locale,
    );
    try {
      const { document } =
        await this.overdueAccountsDefinition.generate(context);
      return document;
    } catch (error: unknown) {
      throw new ReportRequestContextException(error, context);
    }
  }

  // ─── Email send endpoints (report-endpoint-send-email) ───────────────────────

  @Post('payments-report/email')
  @RequiredPermission('reportes', 'read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Reporte de Abonos por email' })
  @ApiBody({ type: SendReportEmailDto })
  @ApiResponse({ status: 400, description: 'Falta clienteId' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  sendPaymentsReportEmail(
    @Body() body: SendReportEmailDto,
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
  ) {
    if (!body.clienteId) {
      throw new BadRequestException('clienteId es requerido');
    }
    return this.executeEmailRequest(
      'payments-report',
      {
        clienteId: body.clienteId,
        fechaDesde: body.fechaDesde,
        fechaHasta: body.fechaHasta,
      },
      body,
      actor,
      timeZone,
      locale,
    );
  }

  @Post('connection-history/email')
  @RequiredPermission('reportes', 'read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Historial de Conexión por email' })
  @ApiBody({ type: SendReportEmailDto })
  @ApiResponse({ status: 400, description: 'Falta contratoId' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  sendConnectionHistoryEmail(
    @Body() body: SendReportEmailDto,
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
  ) {
    if (!body.contratoId) {
      throw new BadRequestException('contratoId es requerido');
    }
    return this.executeEmailRequest(
      'connection-history',
      {
        contratoId: body.contratoId,
        fechaDesde: body.fechaDesde,
        fechaHasta: body.fechaHasta,
      },
      body,
      actor,
      timeZone,
      locale,
    );
  }

  @Post('payment-agreement/email')
  @RequiredPermission('reportes', 'read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Convenio de Pago por email' })
  @ApiBody({ type: SendReportEmailDto })
  @ApiResponse({ status: 400, description: 'Falta convenioId' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  sendPaymentAgreementEmail(
    @Body() body: SendReportEmailDto,
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
  ) {
    if (!body.convenioId) {
      throw new BadRequestException('convenioId es requerido');
    }
    return this.executeEmailRequest(
      'payment-agreement',
      { convenioId: body.convenioId },
      body,
      actor,
      timeZone,
      locale,
    );
  }

  @Post('account-statement/email')
  @RequiredPermission('reportes', 'read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Estado de Cuenta por email' })
  @ApiBody({ type: SendReportEmailDto })
  @ApiResponse({ status: 400, description: 'Falta contratoId' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  sendAccountStatementEmail(
    @Body() body: SendReportEmailDto,
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
  ) {
    if (!body.contratoId) {
      throw new BadRequestException('contratoId es requerido');
    }
    return this.executeEmailRequest(
      'account-statement',
      {
        contratoId: body.contratoId,
        fechaDesde: body.fechaDesde,
        fechaHasta: body.fechaHasta,
      },
      body,
      actor,
      timeZone,
      locale,
    );
  }

  @Post('clients/email')
  @RequiredPermission('reportes', 'read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar Listado de Clientes por email' })
  @ApiBody({ type: SendClientsListEmailDto })
  @ApiResponse({ status: 400, description: 'Falta destinatario' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  sendClientsListEmail(
    @Body() body: SendClientsListEmailDto,
    @CurrentUser() actor: JwtPayload,
    @Headers('x-time-zone') timeZone: string | undefined,
    @Headers('accept-language') locale: string | undefined,
  ) {
    if (!body.destinatario) {
      throw new BadRequestException(
        'destinatario es obligatorio para el listado de clientes',
      );
    }
    return this.executeEmailRequest(
      'clients-list',
      body.filtros ?? {},
      body,
      actor,
      timeZone,
      locale,
    );
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

  private createContext<TFilters extends object>(
    reportType: ReportType,
    actor: JwtPayload,
    filters: TFilters,
    timeZone?: string,
    locale?: string,
  ): ReportRequestContext<TFilters> {
    const context = this.contextFactory.create({
      reportType,
      actor,
      filters,
      timeZone,
      locale,
    });
    this.logger.log(`Generating ${reportType} actorId=${context.actor.userId}`);
    return context;
  }

  private async executeEmailRequest<TFilters extends object>(
    reportType: ReportKey,
    filters: TFilters,
    options: Pick<SendReportEmailDto, 'destinatario' | 'subject' | 'idempotencyKey'>,
    actor: JwtPayload,
    timeZone?: string,
    locale?: string,
  ) {
    const context = this.createContext(
      reportType,
      actor,
      filters,
      timeZone,
      locale,
    );
    try {
      return await this.sendReportByEmail.execute({
        context,
        destinatarioOverride: options.destinatario,
        subjectOverride: options.subject,
        idempotencyKey: options.idempotencyKey,
      });
    } catch (error: unknown) {
      throw new ReportRequestContextException(error, context);
    }
  }

  /** Negotiates the output adapter before any call to the PDF dispatcher. */
  private async handleNegotiatedReport<
    TFilters extends object,
    TDocument extends ReportDocument,
  >(
    reportType: ReportKey,
    context: ReportRequestContext<TFilters>,
    definition: ReportDefinition<TFilters, TDocument>,
    res: Response,
  ): Promise<void> {
    const wantsPdf = this.acceptsOnlyPdf(res.req.headers.accept);

    try {
      const { document } = await definition.generate(context);
      if (!wantsPdf) {
        const filename = buildPdfFileName(reportType).replace(
          /\.pdf$/i,
          '.json',
        );
        this.respondWithJson(res, document, filename);
        return;
      }

      await this.withPdfRequestAbort(res, async (signal) => {
        const { buffer, filename } = await this.dispatcher.dispatch(
          reportType,
          document,
          { signal },
        );
        this.respondWithPdf(res, buffer, filename);
      });
    } catch (error: unknown) {
      throw new ReportRequestContextException(error, context);
    }
  }

  private acceptsOnlyPdf(accept?: string): boolean {
    const acceptedTypes = (accept ?? '')
      .toLowerCase()
      .split(',')
      .map((value) => value.trim().split(';')[0].trim())
      .filter(Boolean);
    return (
      acceptedTypes.length > 0 &&
      acceptedTypes.every((type) => type === 'application/pdf')
    );
  }

  private respondWithJson(
    res: Response,
    data: ReportDocument,
    filename: string,
  ): void {
    res.set({
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `inline; filename="${filename}"`,
    });
    const safeJson = JSON.stringify(data, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    );
    res.send(safeJson);
  }

  private respondWithPdf(
    res: Response,
    buffer: Buffer,
    filename: string,
  ): void {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
