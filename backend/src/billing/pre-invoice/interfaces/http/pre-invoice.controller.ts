import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiExtraModels,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import { PreInvoiceService } from '../../application/pre-invoice.service';
import { FindAllPreInvoicesDto } from '../dto/find-all-pre-invoices.dto';
import { UpdatePreInvoiceStateDto } from '../dto/update-pre-invoice-state.dto';
import { buildPdfFileName } from 'src/infrastructure/pdf/utils/pdf-format.utils';
import { PreInvoiceResponseDto } from '../dto/pre-invoice-response.dto';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { GeneratePreInvoicePdfUseCase } from '../../application/use-cases/generate-pre-invoice-pdf.use-case';
import { SendPreInvoiceByEmailUseCase } from '../../application/use-cases/send-pre-invoice-by-email.use-case';

@ApiTags('pre-invoices')
@ApiBearerAuth()
@ApiExtraModels(PreInvoiceResponseDto, PaginationMetaDto)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('pre-invoices')
export class PreInvoiceController {
  constructor(
    private readonly preInvoiceService: PreInvoiceService,
    private readonly generatePreInvoicePdf: GeneratePreInvoicePdfUseCase,
    private readonly sendPreInvoiceByEmail: SendPreInvoiceByEmailUseCase,
  ) {}

  /**
   * GET /pre-invoices/estados
   * Pre-invoice status catalog
   */
  @ApiOperation({
    summary: 'List pre-invoice statuses',
    description:
      'Returns the available statuses for pre-invoices with their order',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pre-invoice statuses',
    type: [EnumStateDto],
  })
  @RequiredPermission('pre-invoices', 'read')
  @Get('estados')
  async findAllStates(): Promise<EnumStateDto[]> {
    return this.preInvoiceService.findAllStates();
  }

  /**
   * GET /pre-invoices
   * List pre-invoices with pagination and optional filters
   */
  @ApiOperation({
    summary: 'List pre-invoices',
    description:
      'Returns paginated list of pre-invoices. Filters: batchId, periodId, status, contractId, identification',
  })
  @ApiPaginatedResponse(PreInvoiceResponseDto)
  @RequiredPermission('pre-invoices', 'read')
  @Get()
  async findAll(
    @Query() query: FindAllPreInvoicesDto,
  ): Promise<PaginatedResult<any>> {
    return this.preInvoiceService.findAll(query.page, query.limit, {
      loteId: query.loteId,
      periodoId: query.periodoId,
      estado: query.estado,
      contratoId: query.contratoId,
      identificacion: query.identificacion,
    });
  }

  /**
   * GET /pre-invoices/:id
   * Get pre-invoice details with its line items
   */
  @ApiOperation({
    summary: 'Get pre-invoice by ID',
    description:
      'Returns the complete pre-invoice detail including line items, contract, client, batch, and period information',
  })
  @ApiParam({
    name: 'id',
    description: 'Pre-invoice ID',
    type: Number,
    example: 1,
  })
  @RequiredPermission('pre-invoices', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.preInvoiceService.findOne(id);
  }

  /**
   * GET /pre-invoices/:id/pdf
   * Generate pre-invoice PDF
   */
  @ApiOperation({ summary: 'Generate pre-invoice PDF' })
  @ApiParam({
    name: 'id',
    description: 'Pre-invoice ID',
    type: Number,
    example: 1,
  })
  @RequiredPermission('pre-invoices', 'read')
  @Get(':id/pdf')
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.generatePreInvoicePdf.execute(id);
    const filename = buildPdfFileName('prefactura');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  /**
   * POST /pre-invoices/:id/send-email
   * Generate PDF and queue planilla email for one pre-invoice
   */
  @ApiOperation({
    summary: 'Send planilla by email',
    description:
      'Generates the pre-invoice PDF and queues an email with the planilla attached',
  })
  @ApiResponse({ status: 200, description: 'Email queued successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Client has no email',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Pre-invoice not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Pre-invoice ID',
    type: Number,
    example: 1,
  })
  @RequiredPermission('pre-invoices', 'update')
  @Post(':id/send-email')
  async sendEmail(@Param('id', ParseIntPipe) id: number) {
    return this.sendPreInvoiceByEmail.execute(id);
  }

  /**
   * PATCH /pre-invoices/:id/state
   * Change pre-invoice status
   */
  @ApiOperation({
    summary: 'Change pre-invoice status',
    description:
      'Transitions a pre-invoice according to status rules. E.g: GENERATED -> IN_REVIEW -> APPROVED/REJECTED. Requires reason if rejected.',
  })
  @ApiParam({
    name: 'id',
    description: 'Pre-invoice ID',
    type: Number,
    example: 1,
  })
  @RequiredPermission('pre-invoices', 'update')
  @Patch(':id/state')
  async updateState(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePreInvoiceStateDto,
    @CurrentUser() user: any,
  ) {
    return this.preInvoiceService.updateState(
      id,
      dto.action,
      user?.email ?? user?.sub?.toString(),
      dto.motivoRechazo,
    );
  }
}
