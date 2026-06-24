import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { PdfService } from '../../../infrastructure/pdf/pdf.service';
import { GeneratePdfUseCase } from '../../../infrastructure/pdf/use-cases/generate-pdf.use-case';
import { ClientsListReportFilterDto } from '../../dto/clients-list-report-filter.dto';
import { ClientsListReportSpec } from '../../specs/clients-list.report-spec';
import { PaymentsReportFilterDto } from '../../dto/payments-report-filter.dto';
import { PaymentsReportSpec } from '../../specs/payments-report.report-spec';
import { ConnectionHistoryFilterDto } from '../../dto/connection-history-filter.dto';
import { ConnectionHistoryReportSpec } from '../../specs/connection-history.report-spec';
import { AccountStatementFilterDto } from '../../dto/account-statement-filter.dto';
import { AccountStatementReportSpec } from '../../specs/account-statement.report-spec';
import { PaymentAgreementLegacyFilterDto } from '../../dto/payment-agreement-legacy-filter.dto';
import { PaymentAgreementLegacyReportSpec } from '../../specs/payment-agreement-legacy.report-spec';
import { buildPdfFileName } from '../../../infrastructure/pdf/utils/pdf-format.utils';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(
    private readonly pdfService: PdfService,
    private readonly generatePdf: GeneratePdfUseCase,
    private readonly clientsListSpec: ClientsListReportSpec,
    private readonly paymentsReportSpec: PaymentsReportSpec,
    private readonly connectionHistorySpec: ConnectionHistoryReportSpec,
    private readonly accountStatementSpec: AccountStatementReportSpec,
    private readonly paymentAgreementLegacySpec: PaymentAgreementLegacyReportSpec,
  ) {}

  // ─── Real data endpoints ────────────────────────────────────────────────────

  @Get('clients-list')
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
    await this.sendPdf(
      res,
      'clients-list',
      data,
      buildPdfFileName('clientes', 'General'),
    );
  }

  @Get('payments-report')
  @ApiOperation({
    summary: 'Reporte PDF — Abonos',
    description:
      'Genera un PDF con los pagos aplicados a facturas. Soporta filtro por rango de fechas y cliente.',
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
    await this.sendPdf(
      res,
      'payments-report',
      data,
      buildPdfFileName('abonos', 'General'),
    );
  }

  @Get('payments-report-legacy')
  @ApiOperation({
    summary: 'Reporte PDF — Abonos (Legacy)',
    description:
      'Genera un PDF con el listado detallado de abonos en el formato de impresión antiguo (matriz de totales por factura).',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async paymentsReportLegacyPdf(
    @Query() filters: PaymentsReportFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating payments-report-legacy PDF — filters: ${JSON.stringify(filters)}`,
    );
    // Usamos el mismo spec de datos, solo cambia la plantilla.
    const data = await this.paymentsReportSpec.fetchData(filters);
    await this.sendPdf(
      res,
      'payments-report-legacy',
      data,
      buildPdfFileName('abonos-legacy', 'General'),
    );
  }

  @Get('payments-report-modern')
  @ApiOperation({
    summary: 'Reporte PDF — Abonos (Moderno)',
    description:
      'Genera un PDF con el listado detallado de abonos en un formato moderno y estilizado, con orientación horizontal.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async paymentsReportModernPdf(
    @Query() filters: PaymentsReportFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating payments-report-modern PDF — filters: ${JSON.stringify(filters)}`,
    );
    // Reutilizamos el mismo spec de datos
    const data = await this.paymentsReportSpec.fetchData(filters);
    await this.sendPdf(
      res,
      'payments-report-modern',
      data,
      buildPdfFileName('abonos-moderno', 'General'),
    );
  }

  @Get('connection-history')
  @ApiOperation({
    summary: 'Reporte PDF — Historial de Conexión',
    description:
      'Genera un PDF con el historial de facturación por período para un contrato específico. Filtros opcionales por rango de fechas (fechaDesde/fechaHasta). Si no se envían, devuelve todo el historial.',
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
    const clienteNombre = this.getClienteNombre(data.reporte);
    await this.sendPdf(
      res,
      'connection-history',
      data,
      buildPdfFileName('historial-conexion', clienteNombre),
    );
  }

  @Get('connection-history-legacy')
  @ApiOperation({
    summary: 'Reporte PDF — Historial de Conexión (Legacy)',
    description:
      'Genera un PDF con el historial de conexión en el formato de impresión antiguo (matriz de detalles de facturación por cuenta).',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async connectionHistoryLegacyPdf(
    @Query() filters: ConnectionHistoryFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating connection-history-legacy PDF — filters: ${JSON.stringify(filters)}`,
    );
    // Reutilizamos el mismo spec de datos
    const data = await this.connectionHistorySpec.fetchData(filters);
    const clienteNombre = this.getClienteNombre(data.reporte);
    await this.sendPdf(
      res,
      'connection-history-legacy',
      data,
      buildPdfFileName('historial-conexion-legacy', clienteNombre),
    );
  }

  @Get('connection-history-modern')
  @ApiOperation({
    summary: 'Reporte PDF — Historial de Conexión (Moderno)',
    description:
      'Genera un PDF con el historial de conexión en un formato moderno y estilizado.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async connectionHistoryModernPdf(
    @Query() filters: ConnectionHistoryFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating connection-history-modern PDF — filters: ${JSON.stringify(filters)}`,
    );
    // Reutilizamos el mismo spec de datos
    const data = await this.connectionHistorySpec.fetchData(filters);
    const clienteNombre = this.getClienteNombre(data.reporte);
    await this.sendPdf(
      res,
      'connection-history-modern',
      data,
      buildPdfFileName('historial-conexion-moderno', clienteNombre),
    );
  }

  @Get('account-statement')
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
    const clienteNombre = this.getClienteNombre(data.reporte);
    await this.sendPdf(
      res,
      'account-statement',
      data,
      buildPdfFileName('estado-cuenta', clienteNombre),
    );
  }

  @Get('payment-agreement-legacy')
  @ApiOperation({
    summary: 'Reporte PDF — Convenio de Pago (Legacy)',
    description:
      'Genera el PDF del convenio de pago usando el formato físico legacy. Requiere convenioId.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async paymentAgreementLegacyPdf(
    @Query() filters: PaymentAgreementLegacyFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating payment-agreement-legacy PDF — filters: ${JSON.stringify(filters)}`,
    );
    const data = await this.paymentAgreementLegacySpec.fetchData(filters);
    await this.sendPdf(
      res,
      'payment-agreement-legacy',
      data,
      buildPdfFileName('convenio-legacy', 'General'),
    );
  }

  @Get('payment-agreement-modern')
  @ApiOperation({
    summary: 'Reporte PDF — Convenio de Pago (Moderno)',
    description:
      'Genera el PDF del convenio de pago usando un formato moderno y estilizado. Requiere convenioId.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado (binary)',
    content: { 'application/pdf': {} },
  })
  async paymentAgreementModernPdf(
    @Query() filters: PaymentAgreementLegacyFilterDto,
    @Res() res: Response,
  ) {
    this.logger.log(
      `Generating payment-agreement-modern PDF — filters: ${JSON.stringify(filters)}`,
    );
    // Reutilizamos el mismo spec porque la data es exactamente igual a la del legacy
    const data = await this.paymentAgreementLegacySpec.fetchData(filters);
    await this.sendPdf(
      res,
      'payment-agreement-modern',
      data,
      buildPdfFileName('convenio-moderno', 'General'),
    );
  }

  // ─── Meta ────────────────────────────────────────────────────────────────────

  @Get('types')
  @ApiOperation({ summary: 'Listar tipos de reportes disponibles' })
  getTypes() {
    return { registered: this.pdfService.getAvailableTypes() };
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async sendPdf(
    res: Response,
    type: string,
    data: Record<string, unknown>,
    filename: string,
  ): Promise<void> {
    const buffer = await this.generatePdf.execute(type, data);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  private getClienteNombre(reporte: unknown): string | undefined {
    return (reporte as Record<string, unknown>)?.clienteNombre as
      | string
      | undefined;
  }
}
