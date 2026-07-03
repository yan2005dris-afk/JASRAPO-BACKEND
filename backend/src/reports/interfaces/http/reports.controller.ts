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
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
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
import { SendPaymentsReportEmailDto } from '../../dto/send-payments-report-email.dto';
import { SendConnectionHistoryEmailDto } from '../../dto/send-connection-history-email.dto';
import { SendPaymentAgreementEmailDto } from '../../dto/send-payment-agreement-email.dto';
import { SendAccountStatementEmailDto } from '../../dto/send-account-statement-email.dto';
import { SendClientsListEmailDto } from '../../dto/send-clients-list-email.dto';
import { SendReportByEmailUseCase } from '../../application/use-cases/send-report-by-email.use-case';

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
    private readonly sendReportByEmail: SendReportByEmailUseCase,
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
    await this.sendPdf(res, 'clients-list', data, `clientes-${Date.now()}`);
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
    await this.sendPdf(res, 'payments-report', data, `abonos-${Date.now()}`);
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
    await this.sendPdf(
      res,
      'connection-history',
      data,
      `historial-conexion-${Date.now()}`,
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
    await this.sendPdf(
      res,
      'account-statement',
      data,
      `estado-cuenta-${Date.now()}`,
    );
  }

  // ─── Meta ────────────────────────────────────────────────────────────────────

  @Get('types')
  @ApiOperation({ summary: 'Listar tipos de reportes disponibles' })
  getTypes() {
    return { registered: this.pdfService.getAvailableTypes() };
  }

  // ─── Email send endpoints (PR 3) ───────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Enviar Reporte de Abonos por email' })
  @ApiResponse({ status: 400, description: 'Falta clienteId o email' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  @HttpCode(HttpStatus.OK)
  @RequiredPermission('reportes', 'read')
  @Post('payments-report/email')
  sendPaymentsReportEmail(@Body() body: SendPaymentsReportEmailDto) {
    return this.sendReportByEmail.execute({
      reportType: 'payments-report',
      filters: body as unknown as Record<string, unknown>,
      destinatarioOverride: body.destinatario,
      subjectOverride: body.subject,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Enviar Historial de Conexión por email' })
  @ApiResponse({ status: 400, description: 'Falta contratoId o email' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  @HttpCode(HttpStatus.OK)
  @RequiredPermission('reportes', 'read')
  @Post('connection-history/email')
  sendConnectionHistoryEmail(@Body() body: SendConnectionHistoryEmailDto) {
    return this.sendReportByEmail.execute({
      reportType: 'connection-history',
      filters: body as unknown as Record<string, unknown>,
      destinatarioOverride: body.destinatario,
      subjectOverride: body.subject,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Enviar Convenio de Pago por email' })
  @ApiResponse({ status: 400, description: 'Falta convenioId o email' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  @HttpCode(HttpStatus.OK)
  @RequiredPermission('reportes', 'read')
  @Post('payment-agreement/email')
  sendPaymentAgreementEmail(@Body() body: SendPaymentAgreementEmailDto) {
    return this.sendReportByEmail.execute({
      reportType: 'payment-agreement',
      filters: body as unknown as Record<string, unknown>,
      destinatarioOverride: body.destinatario,
      subjectOverride: body.subject,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Enviar Estado de Cuenta por email' })
  @ApiResponse({ status: 400, description: 'Falta contratoId o email' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  @HttpCode(HttpStatus.OK)
  @RequiredPermission('reportes', 'read')
  @Post('account-statement/email')
  sendAccountStatementEmail(@Body() body: SendAccountStatementEmailDto) {
    return this.sendReportByEmail.execute({
      reportType: 'account-statement',
      filters: body as unknown as Record<string, unknown>,
      destinatarioOverride: body.destinatario,
      subjectOverride: body.subject,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Enviar Listado de Clientes por email' })
  @ApiResponse({ status: 400, description: 'Falta destinatario' })
  @ApiResponse({ status: 403, description: 'Sin permiso reportes:read' })
  @HttpCode(HttpStatus.OK)
  @RequiredPermission('reportes', 'read')
  @Post('clients/email')
  sendClientsListEmail(@Body() body: SendClientsListEmailDto) {
    // Route-level guard: only this route requires `destinatario` (no
    // resource-derived recipient exists for a client listing).
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
      'Content-Disposition': `inline; filename="${filename}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
