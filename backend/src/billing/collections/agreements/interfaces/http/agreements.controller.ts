import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { AgreementsService } from '../../application/agreements.service';
import { CreateAgreementDto } from '../dto/create-agreement.dto';
import { UpdateAgreementDto } from '../dto/update-agreement.dto';
import { AgreementResponseDto } from '../dto/agreement-response.dto';
import { DebtSummaryResponseDto } from '../dto/debt-summary-response.dto';
import { InstallmentResponseDto } from '../dto/installment-response.dto';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { FindAllAgreementsDto } from '../dto/find-all-agreements.dto';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { ApiPaginatedResponse } from 'src/shared/pagination/api-paginated-response.decorator';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';
import { PaginationMetaDto } from 'src/shared/pagination/pagination-meta.dto';
import { observePdfRequestAbort } from 'src/infrastructure/pdf/pdf-request-abort.util';

@ApiTags('agreements')
@ApiBearerAuth()
@ApiExtraModels(AgreementResponseDto, PaginationMetaDto, InstallmentResponseDto)
@Controller('agreements')
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  /**
   * GET /agreements/states
   * Catálogo de estados de convenio
   */
  @ApiOperation({
    summary: 'Listar estados de convenio',
    description:
      'Retorna los estados disponibles para convenios, derivados del enum de Prisma',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados de convenio',
    type: [EnumStateDto],
  })
  @RequiredPermission('agreements', 'read')
  @Get('states')
  async findAllStates(): Promise<EnumStateDto[]> {
    return this.agreementsService.findAllAgreementStates();
  }

  /**
   * GET /agreements/installment-states
   * Catálogo de estados de cuota de convenio
   */
  @ApiOperation({
    summary: 'Listar estados de cuota',
    description:
      'Retorna los estados disponibles para cuotas de convenio, derivados del enum de Prisma',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados de cuota',
    type: [EnumStateDto],
  })
  @RequiredPermission('agreements', 'read')
  @Get('installment-states')
  async findAllInstallmentStates(): Promise<EnumStateDto[]> {
    return this.agreementsService.findAllInstallmentStates();
  }

  /**
   * GET /agreements/debt-summary/:contratoId
   * Resumen de deuda por contrato
   */
  @ApiOperation({
    summary: 'Resumen de deuda por contrato',
    description:
      'Retorna el resumen de deuda de un contrato: total, tasa de interés, meses de mora y prefacturas impagadas',
  })
  @ApiParam({
    name: 'contratoId',
    description: 'ID del contrato',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de deuda',
    type: DebtSummaryResponseDto,
  })
  @RequiredPermission('agreements', 'read')
  @Get('debt-summary/:contratoId')
  async getDebtSummary(
    @Param('contratoId', ParseBigIntPipe) contratoId: bigint,
  ): Promise<DebtSummaryResponseDto> {
    return this.agreementsService.getDebtSummary(contratoId);
  }

  /**
   * POST /agreements
   * Crear convenio de pago
   */
  @ApiOperation({
    summary: 'Crear convenio',
    description:
      'Crea un nuevo convenio de pago para un contrato moroso, generando automáticamente las cuotas correspondientes',
  })
  @ApiResponse({
    status: 201,
    description: 'Convenio creado exitosamente',
    type: AgreementResponseDto,
  })
  @RequiredPermission('agreements', 'create')
  @Post()
  async create(@Body() dto: CreateAgreementDto): Promise<AgreementResponseDto> {
    const entity = await this.agreementsService.create(dto);
    return AgreementResponseDto.fromRow(entity);
  }

  /**
   * PATCH /agreements/:id
   * Actualizar estado del convenio
   */
  @ApiOperation({
    summary: 'Actualizar estado del convenio',
    description:
      'Cambia el estado de un convenio. PAGADO: marca convenio y cuotas como pagadas. ACTIVO: aprueba el convenio.',
  })
  @ApiResponse({
    status: 200,
    description: 'Convenio actualizado exitosamente',
    type: AgreementResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'ID del convenio',
    type: String,
    example: '1',
  })
  @RequiredPermission('agreements', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateAgreementDto,
  ): Promise<AgreementResponseDto> {
    const entity = await this.agreementsService.update(id, dto);
    return AgreementResponseDto.fromRow(entity);
  }

  /**
   * GET /agreements
   * Lista convenios con paginación y filtro opcional por contrato
   */
  @ApiOperation({
    summary: 'Listar convenios',
    description:
      'Retorna lista paginada de convenios activos. Filtrar por contratoId si se provee.',
  })
  @ApiPaginatedResponse(AgreementResponseDto)
  @RequiredPermission('agreements', 'read')
  @Get()
  async findAll(
    @Query() query: FindAllAgreementsDto,
  ): Promise<PaginatedResult<AgreementResponseDto>> {
    const result = await this.agreementsService.findAll({
      pagination: { page: query.page, limit: query.limit },
      contratoId: query.contratoId,
      estado: query.estado,
      search: query.search,
    });

    return {
      data: AgreementResponseDto.fromRowList(result.data),
      meta: result.meta,
    };
  }

  /**
   * GET /agreements/:id
   * Obtener convenio por ID, incluyendo sus cuotas
   */
  @ApiOperation({
    summary: 'Obtener convenio por ID',
    description:
      'Retorna los detalles del convenio incluyendo las cuotas generadas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del convenio',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Convenio encontrado',
    type: AgreementResponseDto,
  })
  @RequiredPermission('agreements', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<AgreementResponseDto> {
    const entity = await this.agreementsService.findOne(id);
    return AgreementResponseDto.fromRow(entity);
  }

  /**
   * DELETE /agreements/:id
   * Anular convenio (soft delete)
   */
  @ApiOperation({
    summary: 'Anular convenio',
    description:
      'Marca un convenio como ANULADO y realiza soft delete. Requiere que el convenio exista.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del convenio',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Convenio anulado exitosamente',
    type: AgreementResponseDto,
  })
  @RequiredPermission('agreements', 'delete')
  @Delete(':id')
  async cancel(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<AgreementResponseDto> {
    const entity = await this.agreementsService.cancel(id);
    return AgreementResponseDto.fromRow(entity);
  }

  /**
   * GET /agreements/:id/pdf
   * Generate payment agreement PDF
   */
  @ApiOperation({ summary: 'Generate payment agreement PDF' })
  @ApiParam({
    name: 'id',
    description: 'ID del convenio',
    type: String,
    example: '1',
  })
  @RequiredPermission('agreements', 'read')
  @Get(':id/pdf')
  async generatePdf(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Res() res: Response,
  ) {
    const requestAbort = observePdfRequestAbort(res);
    try {
      const { buffer, filename } = await this.agreementsService.generatePdf(
        id,
        requestAbort.signal,
      );
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } finally {
      requestAbort.dispose();
    }
  }
}
