import { Controller, Get, Query, Res, Logger, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { GeneratePdfUseCase } from '../../../infrastructure/pdf/use-cases/generate-pdf.use-case';
import { JwtAuthGuard } from '../../../identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from '../../../infrastructure/common/decorators/require-permission.decorator';
import { ClientsListReportFilterDto } from '../../dto/clients-list-report-filter.dto';
import { ClientsListReportSpec } from '../../specs/clients-list.report-spec';
import { PaymentsReportFilterDto } from '../../dto/payments-report-filter.dto';
import { PaymentsReportSpec } from '../../specs/payments-report.report-spec';
import { ConnectionHistoryFilterDto } from '../../dto/connection-history-filter.dto';
import { ConnectionHistoryReportSpec } from '../../specs/connection-history.report-spec';
import { AccountStatementFilterDto } from '../../dto/account-statement-filter.dto';
import { AccountStatementReportSpec } from '../../specs/account-statement.report-spec';
import { PaymentAgreementLegacyFilterDto } from '../../dto/payment-agreement-legacy-filter.dto';
import { GetPaymentAgreementPdfDataUseCase } from '../../../billing/collections/agreements/application/use-cases/get-payment-agreement-pdf-data.use-case';
import { ReportStyleDispatcher } from '../../application/report-style.dispatcher';

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
@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(
    private readonly generatePdf: GeneratePdfUseCase,
    private readonly clientsListSpec: ClientsListReportSpec,
    private readonly paymentsReportSpec: PaymentsReportSpec,
    private readonly connectionHistorySpec: ConnectionHistoryReportSpec,
    private readonly accountStatementSpec: AccountStatementReportSpec,
    private readonly paymentAgreementPdfData: GetPaymentAgreementPdfDataUseCase,
    private readonly dispatcher: ReportStyleDispatcher,
  ) {}

  // ─── Consolidated dispatcher endpoints (REQ-1/2/3) ──────────────────────────

  @Get('payments-report')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte PDF — Abonos (estilo configurable)',
    description:
      'Genera un PDF con los pagos aplicados a facturas. El estilo (legacy|modern) se resuelve desde sistema_config (`reporte.estilo.payments-report`, fallback `reporte.estilo.default`, último recurso `legacy`).',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async paymentsReportPdf(
    @Query() filters: PaymentsReportFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating payments-report PDF — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.paymentsReportSpec.fetchData(filters);
    const { buffer, filename } = await this.dispatcher.dispatch(
      'payments-report',
      data,
    );
    this.respondWithPdf(res, buffer, filename);
  }

  @Get('connection-history')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte PDF — Historial de Conexión (estilo configurable)',
    description:
      'Genera un PDF con el historial de facturación por período. El estilo se resuelve desde sistema_config (`reporte.estilo.connection-history`).',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async connectionHistoryPdf(
    @Query() filters: ConnectionHistoryFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating connection-history PDF — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.connectionHistorySpec.fetchData(filters);
    const { buffer, filename } = await this.dispatcher.dispatch(
      'connection-history',
      data,
    );
    this.respondWithPdf(res, buffer, filename);
  }

  @Get('payment-agreement')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte PDF — Convenio de Pago (estilo configurable)',
    description:
      'Genera el PDF del convenio de pago. El estilo se resuelve desde sistema_config (`reporte.estilo.payment-agreement`).',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async paymentAgreementPdf(
    @Query() filters: PaymentAgreementLegacyFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating payment-agreement PDF — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.paymentAgreementPdfData.execute(
      BigInt(filters.convenioId),
    );
    const { buffer, filename } = await this.dispatcher.dispatch(
      'payment-agreement',
      data,
    );
    this.respondWithPdf(res, buffer, filename);
  }

  // ─── Untouched endpoints (REQ-10) ───────────────────────────────────────────

  @Get('clients-list')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte PDF — Listado de Clientes',
    description:
      'Genera un PDF con todos los clientes. Soporta los mismos filtros que el listado de clientes. Sin paginación — incluye todos los registros que coincidan.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async clientsListPdf(
    @Query() filters: ClientsListReportFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating clients-list PDF — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.clientsListSpec.fetchData(filters);
    const buffer = await this.generatePdf.execute('clients-list', data);
    this.respondWithPdf(res, buffer, 'clientes-General.pdf');
  }

  @Get('account-statement')
  @RequiredPermission('reportes', 'read')
  @ApiOperation({
    summary: 'Reporte PDF — Estado de Cuenta',
    description:
      'Genera un PDF con el estado de cuenta de un contrato. Filtros opcionales por rango de fechas (fechaDesde/fechaHasta). Por defecto trae los últimos 6 períodos.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async accountStatementPdf(
    @Query() filters: AccountStatementFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating account-statement PDF — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.accountStatementSpec.fetchData(filters);
    const buffer = await this.generatePdf.execute('account-statement', data);
    this.respondWithPdf(res, buffer, 'estado-cuenta-General.pdf');
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

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
