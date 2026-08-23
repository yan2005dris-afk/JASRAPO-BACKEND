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
import { GeneratePdfUseCase } from '../../../infrastructure/pdf/use-cases/generate-pdf.use-case';
import { JwtAuthGuard } from '../../../identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from '../../../infrastructure/common/decorators/require-permission.decorator';
import { ClientsListReportFilterDto } from '../dto/clients-list-report-filter.dto';
import { ClientsListReportSpec } from '../../infrastructure/specs/clients-list.report-spec';
import { PaymentsReportFilterDto } from '../dto/payments-report-filter.dto';
import { PaymentsReportSpec } from '../../infrastructure/specs/payments-report.report-spec';
import { ConnectionHistoryFilterDto } from '../dto/connection-history-filter.dto';
import { ConnectionHistoryReportSpec } from '../../infrastructure/specs/connection-history.report-spec';
import { AccountStatementFilterDto } from '../dto/account-statement-filter.dto';
import { AccountStatementReportSpec } from '../../infrastructure/specs/account-statement.report-spec';
import { PaymentAgreementLegacyFilterDto } from '../dto/payment-agreement-legacy-filter.dto';
import { GetPaymentAgreementPdfDataUseCase } from '../../../billing/collections/agreements/application/use-cases/get-payment-agreement-pdf-data.use-case';
import { ReportStyleDispatcher } from '../../application/report-style.dispatcher';
import { SendReportEmailDto } from '../dto/send-report-email.dto';
import { SendClientsListEmailDto } from '../dto/send-clients-list-email.dto';
import { SendReportByEmailUseCase } from '../../application/use-cases/send-report-by-email.use-case';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

/**
 * Reports HTTP surface.
 *
 * Reduced from 10 endpoints to 5 by PR2 of `report-style-system-config`:
 *   - GET /reports/payments-report        ← consolidated (formerly -legacy/-modern)
 *   - GET /reports/connection-history     ← consolidated (formerly -legacy/-modern)
 *   - GET /reports/payment-agreement      ← consolidated (formerly -legacy/-modern)
 *   - GET /reports/clients-list           ← untouched
 *   - GET /reports/account-statement      ← untouched
 *
 * The consolidated endpoints route through `ReportStyleDispatcher`, which
 * resolves the report style (`legacy` | `modern`) from `sistema_config`
 * and dispatches to the matching pdf-type. The two untouched endpoints
 * keep the original `GeneratePdfUseCase.execute(type, data)` flow.
 *
 * Auth (REQ-5/6): class-level `@UseGuards(JwtAuthGuard, PermissionsGuard)`
 * + class-level `@ApiBearerAuth()` for OpenAPI. Per-endpoint permission
 * is explicit via `@RequiredPermission('reportes', 'read')` instead of
 * relying on the guard's convention-based inference.
 */
import { OverdueAccountsFilterDto } from '../dto/overdue-accounts-filter.dto';
import { OverdueAccountsReportSpec } from '../../infrastructure/specs/overdue-accounts.report-spec';

@LogContext()
@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly generatePdf: GeneratePdfUseCase,
    private readonly clientsListSpec: ClientsListReportSpec,
    private readonly paymentsReportSpec: PaymentsReportSpec,
    private readonly connectionHistorySpec: ConnectionHistoryReportSpec,
    private readonly accountStatementSpec: AccountStatementReportSpec,
    private readonly overdueAccountsSpec: OverdueAccountsReportSpec,
    private readonly paymentAgreementPdfData: GetPaymentAgreementPdfDataUseCase,
    private readonly dispatcher: ReportStyleDispatcher,
    private readonly sendReportByEmail: SendReportByEmailUseCase,
    private readonly logger: LoggerService,
  ) {}

  // ─── Consolidated dispatcher endpoints (REQ-1/2/3) ──────────────────────────

  @Get('payments-report')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Abonos (estilo configurable)',
    description:
      'Genera un PDF con los pagos aplicados a facturas, o devuelve los datos crudos en JSON según el header `Accept`. El estilo (legacy|modern) se resuelve desde sistema_config (`reporte.estilo`).',
  })
  @ApiResponse({
    status: 200,
    description:
      'PDF generado (binary) o JSON con los datos crudos según Accept',
    content: {
      'application/pdf': {},
      'application/json': {},
    },
  })
  async paymentsReportPdf(
    @Query() filters: PaymentsReportFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating payments-report — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.paymentsReportSpec.fetchData(filters);
    const { buffer, filename } = await this.dispatcher.dispatch(
      'payments-report',
      data,
    );
    this.respondWithContentNegotiation(res, data, buffer, filename);
  }

  @Get('connection-history')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Historial de Conexión (estilo configurable)',
    description:
      'Genera un PDF con el historial de facturación por período, o devuelve los datos crudos en JSON según el header `Accept`. El estilo se resuelve desde sistema_config (`reporte.estilo`).',
  })
  @ApiResponse({
    status: 200,
    description:
      'PDF generado (binary) o JSON con los datos crudos según Accept',
    content: {
      'application/pdf': {},
      'application/json': {},
    },
  })
  async connectionHistoryPdf(
    @Query() filters: ConnectionHistoryFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating connection-history — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.connectionHistorySpec.fetchData(filters);
    const { buffer, filename } = await this.dispatcher.dispatch(
      'connection-history',
      data,
    );
    this.respondWithContentNegotiation(res, data, buffer, filename);
  }

  @Get('payment-agreement')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Convenio de Pago (estilo configurable)',
    description:
      'Genera el PDF del convenio de pago, o devuelve los datos crudos en JSON según el header `Accept`. El estilo se resuelve desde sistema_config (`reporte.estilo`).',
  })
  @ApiResponse({
    status: 200,
    description:
      'PDF generado (binary) o JSON con los datos crudos según Accept',
    content: {
      'application/pdf': {},
      'application/json': {},
    },
  })
  async paymentAgreementPdf(
    @Query() filters: PaymentAgreementLegacyFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating payment-agreement — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.paymentAgreementPdfData.execute(
      BigInt(filters.convenioId),
    );
    const { buffer, filename } = await this.dispatcher.dispatch(
      'payment-agreement',
      data as unknown as Record<string, unknown>,
    );
    this.respondWithContentNegotiation(
      res,
      data as unknown as Record<string, unknown>,
      buffer,
      filename,
    );
  }

  // ─── Untouched endpoints (REQ-10) ───────────────────────────────────────────

  @Get('clients-list')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Listado de Clientes (estilo configurable)',
    description:
      'Genera un PDF con todos los clientes, o devuelve los datos crudos en JSON según el header `Accept`. El estilo (legacy|modern) se resuelve desde sistema_config (`reporte.estilo`).',
  })
  @ApiResponse({
    status: 200,
    description:
      'PDF generado (binary) o JSON con los datos crudos según Accept',
    content: {
      'application/pdf': {},
      'application/json': {},
    },
  })
  async clientsListPdf(
    @Query() filters: ClientsListReportFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating clients-list — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.clientsListSpec.fetchData(filters);
    const { buffer, filename } = await this.dispatcher.dispatch(
      'clients-list',
      data,
    );
    this.respondWithContentNegotiation(res, data, buffer, filename);
  }

  @Get('account-statement')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte de Estado de Cuenta (estilo configurable)',
    description:
      'Genera un PDF con el estado de cuenta de un contrato, o devuelve los datos crudos en JSON según el header `Accept`. El estilo (legacy|modern) se resuelve desde sistema_config (`reporte.estilo`).',
  })
  @ApiResponse({
    status: 200,
    description:
      'PDF generado (binary) o JSON con los datos crudos según Accept',
    content: {
      'application/pdf': {},
      'application/json': {},
    },
  })
  async accountStatementPdf(
    @Query() filters: AccountStatementFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating account-statement — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.accountStatementSpec.fetchData(filters);
    const { buffer, filename } = await this.dispatcher.dispatch(
      'account-statement',
      data,
    );
    this.respondWithContentNegotiation(res, data, buffer, filename);
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
    return this.overdueAccountsSpec.fetchData(filters);
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
      filters: (body.filtros as unknown as Record<string, unknown>) ?? {},
      destinatarioOverride: body.destinatario,
      subjectOverride: body.subject,
    });
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Content negotiation based on the `Accept` request header.
   *
   *   - `Accept: application/json` → JSON payload (raw spec data).
   *   - `Accept: application/pdf` → PDF binary.
   *   - wildcard or missing header → JSON (default).
   *
   * JSON wins if the client sends both `application/json` and `application/pdf`.
   * The BigInt-safe JSON.stringify wrapper handles BigInt values that bypass
   * the global BigIntInterceptor when @Res() is used.
   */
  private respondWithContentNegotiation(
    res: Response,
    data: Record<string, unknown>,
    buffer: Buffer,
    pdfFilename: string,
  ): void {
    const accept = (res.req.headers.accept ?? '').toLowerCase();
    // PDF is opt-in: only when the client sends EXACTLY `application/pdf` (or
    // a comma-separated list where application/pdf is the only listed type).
    // Anything else — including missing header, */*, application/json, or a
    // mix of both — falls through to JSON, the API default.
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
      // BigInt-safe serialization: @Res() bypasses the global BigIntInterceptor
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
