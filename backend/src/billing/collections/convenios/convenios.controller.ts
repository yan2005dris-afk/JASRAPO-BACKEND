import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { ConveniosService } from './convenios.service';
import { CreateConvenioDto } from './dto/create-convenio.dto';
import { ConvenioResponseDto } from './dto/convenio-response.dto';
import { CuotaConvenioResponseDto } from './dto/cuota-convenio-response.dto';
import { DebtSummaryResponseDto } from './dto/debt-summary-response.dto';
import { EstadoConvenioResponseDto } from './dto/estado-convenio-response.dto';
import { EstadoCuotaConvenioResponseDto } from './dto/estado-cuota-convenio-response.dto';

@ApiTags('convenios')
@ApiBearerAuth()
@Controller('convenios')
export class ConveniosController {
  constructor(private readonly conveniosService: ConveniosService) {}

  // ── Catálogos de estados ──────────────────────────────────────────────────

  /**
   * GET /convenios/statuses
   * Catálogo de estados de convenio (desde DB, no hardcodeado)
   */
  @ApiOperation({
    summary: 'Catálogo de estados de convenio',
    description:
      'Retorna los estados disponibles para convenios, consultados desde la base de datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados de convenio',
    type: [EstadoConvenioResponseDto],
  })
  @Get('statuses')
  findAllStatuses(): Promise<EstadoConvenioResponseDto[]> {
    return this.conveniosService.findAllEstadosConvenio();
  }

  /**
   * GET /convenios/installment-statuses
   * Catálogo de estados de cuotas de convenio (desde DB)
   */
  @ApiOperation({
    summary: 'Catálogo de estados de cuota de convenio',
    description:
      'Retorna los estados disponibles para cuotas, consultados desde la base de datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados de cuota',
    type: [EstadoCuotaConvenioResponseDto],
  })
  @Get('installment-statuses')
  findAllInstallmentStatuses(): Promise<EstadoCuotaConvenioResponseDto[]> {
    return this.conveniosService.findAllEstadosCuotaConvenio();
  }

  // ── Deuda ─────────────────────────────────────────────────────────────────

  /**
   * GET /convenios/debt/:contratoId
   * Retorna prefacturas impagadas y deuda total del contrato
   */
  @ApiOperation({
    summary: 'Resumen de deuda por contrato',
    description:
      'Calcula y retorna la deuda total del contrato basada en prefacturas impagadas ' +
      '(estados: GENERADA, EN_REVISION, APROBADA). Incluye el desglose por prefactura.',
  })
  @ApiParam({
    name: 'contratoId',
    description: 'ID del contrato',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de deuda del contrato',
    type: DebtSummaryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('convenios', 'read')
  @Get('debt/:contratoId')
  getDebtSummary(
    @Param('contratoId') contratoId: string,
  ): Promise<DebtSummaryResponseDto> {
    return this.conveniosService.getDebtSummary(contratoId);
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  /**
   * POST /convenios
   * Crea un nuevo convenio de pago con cuotas generadas automáticamente
   */
  @ApiOperation({
    summary: 'Crear convenio de pago',
    description:
      'Crea un convenio de pago para un contrato. ' +
      'Calcula la deuda automáticamente desde las prefacturas impagadas y ' +
      'genera las cuotas distribuyendo el saldo equitativamente.',
  })
  @ApiBody({ type: CreateConvenioDto })
  @ApiResponse({
    status: 201,
    description: 'Convenio creado con cuotas generadas',
    type: ConvenioResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o contrato sin deuda',
  })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('convenios', 'create')
  @Post()
  async create(@Body() dto: CreateConvenioDto): Promise<ConvenioResponseDto> {
    return this.conveniosService.create(dto);
  }

  /**
   * GET /convenios
   * Lista todos los convenios, con filtro opcional por contrato
   */
  @ApiOperation({
    summary: 'Listar convenios',
    description:
      'Retorna lista de convenios activos. Filtrar por contratoId si se provee.',
  })
  @ApiQuery({
    name: 'contratoId',
    description: 'Filtrar por ID de contrato',
    required: false,
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de convenios',
    type: [ConvenioResponseDto],
  })
  @RequiredPermission('convenios', 'read')
  @Get()
  async findAll(
    @Query('contratoId') contratoId?: string,
  ): Promise<ConvenioResponseDto[]> {
    return this.conveniosService.findAll(contratoId);
  }

  /**
   * GET /convenios/:id
   * Obtiene un convenio con todas sus cuotas
   */
  @ApiOperation({
    summary: 'Obtener convenio por ID',
    description:
      'Retorna el convenio con el detalle de todas sus cuotas generadas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del convenio',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Convenio con cuotas',
    type: ConvenioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Convenio no encontrado' })
  @RequiredPermission('convenios', 'read')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ConvenioResponseDto> {
    return this.conveniosService.findOne(id);
  }

  /**
   * GET /convenios/:id/installments
   * Lista las cuotas de un convenio específico
   */
  @ApiOperation({
    summary: 'Listar cuotas del convenio',
    description:
      'Retorna las cuotas del convenio ordenadas por número de cuota',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del convenio',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Cuotas del convenio',
    type: [CuotaConvenioResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Convenio no encontrado' })
  @RequiredPermission('convenios', 'read')
  @Get(':id/installments')
  async findInstallments(
    @Param('id') id: string,
  ): Promise<CuotaConvenioResponseDto[]> {
    return this.conveniosService.findCuotas(id);
  }

  /**
   * DELETE /convenios/:id
   * Anula un convenio (soft delete + estado ANULADO)
   */
  @ApiOperation({
    summary: 'Anular convenio',
    description:
      'Anula un convenio de pago. Realiza soft delete y cambia el estado a ANULADO.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del convenio',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Convenio anulado',
    type: ConvenioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Convenio no encontrado' })
  @RequiredPermission('convenios', 'delete')
  @Delete(':id')
  async cancel(@Param('id') id: string): Promise<ConvenioResponseDto> {
    return this.conveniosService.cancel(id);
  }
}
