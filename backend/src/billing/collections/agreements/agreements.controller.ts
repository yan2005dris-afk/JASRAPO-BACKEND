import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { AgreementsService } from './agreements.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import { AgreementResponseDto } from './dto/agreement-response.dto';
import { DebtSummaryResponseDto } from './dto/debt-summary-response.dto';
import { AgreementStateResponseDto } from './dto/agreement-state-response.dto';
import { InstallmentStateResponseDto } from './dto/installment-state-response.dto';
import { FindAllAgreementsDto } from './dto/find-all-agreements.dto';
import { JwtAuthGuard } from '../../../identity/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from '../../../infrastructure/common/decorators/require-permission.decorator';
import { ParseBigIntPipe } from '../../../infrastructure/common/pipes/parse-bigint.pipe';
import { ApiPaginatedResponse } from '../../../infrastructure/common/decorators/api-paginated-response.decorator';
import type { PaginatedResult } from '../../../infrastructure/common/types/paginated-result.type';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';

@ApiTags('agreements')
@ApiBearerAuth()
@ApiExtraModels(AgreementResponseDto, PaginationMetaDto)
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
    type: [AgreementStateResponseDto],
  })
  @RequiredPermission('agreements', 'read')
  @Get('states')
  async findAllStates(): Promise<AgreementStateResponseDto[]> {
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
    type: [InstallmentStateResponseDto],
  })
  @RequiredPermission('agreements', 'read')
  @Get('installment-states')
  async findAllInstallmentStates(): Promise<InstallmentStateResponseDto[]> {
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
    return this.agreementsService.create(dto);
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
    return this.agreementsService.update(id, dto);
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
    return this.agreementsService.findAll({
      pagination: { page: query.page, limit: query.limit },
      contratoId: query.contratoId,
    });
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
    return this.agreementsService.findOne(id);
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
    return this.agreementsService.cancel(id);
  }
}
