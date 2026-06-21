import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Post,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { JwtPayload } from 'src/identity/auth/interfaces/dto/auth.dto';
import { EstadoLectura } from 'src/shared/enums';
import { GetOperatorReadingsUseCase } from '../../application/use-cases/get-operator-readings.use-case';
import { UpdateReadingUseCase } from 'src/metering/readings/application/use-cases/update-reading.use-case';
import { ActualizarLecturaDto } from 'src/metering/readings/interfaces/dto/update-lectura.dto';
import { ResponseReadingDto } from 'src/metering/readings/interfaces/dto/response-reading.dto';
import { toReadingResponse } from 'src/metering/readings/types/readingMapper';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import { MeterResponseDto } from 'src/metering/meters/interfaces/dto/meter-response.dto';
import { toMeterResponse } from 'src/metering/meters/domain/types/metersMapper';
import { ReportDefectUseCase } from '../../../meters/application/use-cases/report-defect.use-case';
import { DecommissionMeterUseCase } from '../../../meters/application/use-cases/decommission-meter.use-case';
import { InstallMeterUseCase } from '../../../meters/application/use-cases/install-meter.use-case';
import { SyncAllUseCase } from '../../application/use-cases/sync-all.use-cate';
import { DecommissionMeterDto } from './decommission-meter.dto';

@ApiTags('operator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operator')
export class OperatorController {
  constructor(
    private readonly getOperatorReadingsUseCase: GetOperatorReadingsUseCase,
    private readonly updateReadingUseCase: UpdateReadingUseCase,
    private readonly operatorRepository: OperatorRepository,
    private readonly reportDefectUseCase: ReportDefectUseCase,
    private readonly decommissionUseCase: DecommissionMeterUseCase,
    private readonly installUseCase: InstallMeterUseCase,
    private readonly syncAllUseCase: SyncAllUseCase,
  ) {}

  @ApiOperation({
    summary: 'Listar lecturas del operario',
    description:
      'Retorna las lecturas del período activo asignadas al operario autenticado según sus rutas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecturas del operario',
    type: [ResponseReadingDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso lecturas:read' })
  @ApiResponse({ status: 404, description: 'No hay período activo' })
  @RequiredPermission('lecturas', 'read')
  @Get('readings')
  async getOperatorReadings(
    @CurrentUser() user: JwtPayload,
  ): Promise<ResponseReadingDto[]> {
    const operarioId = Number(user.sub);
    return this.getOperatorReadingsUseCase.execute(operarioId);
  }

  @ApiOperation({
    summary: 'Actualizar lectura del operario',
    description:
      'Permite al operario actualizar una lectura de su ruta y transicionarla a POR_REVISION',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lectura',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: ActualizarLecturaDto,
    description: 'Datos a actualizar de la lectura',
  })
  @ApiResponse({
    status: 200,
    description: 'Lectura actualizada',
  })
  @ApiResponse({ status: 400, description: 'Estado no modificable' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Lectura fuera de la ruta asignada',
  })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @RequiredPermission('lecturas', 'update')
  @Patch('readings/:id')
  async updateOperatorReading(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: ActualizarLecturaDto,
  ): Promise<ResponseReadingDto> {
    const operarioId = Number(user.sub);

    // 1. Validate that the reading belongs to the operator's routes
    const lectura = await this.operatorRepository.findReadingWithDetails(id);
    if (!lectura) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    const activePeriod = await this.operatorRepository.findActivePeriod();
    if (!activePeriod) {
      throw new NotFoundException(
        'No hay un período de facturación ABIERTO en el sistema',
      );
    }

    const rutas = await this.operatorRepository.findActiveRoutes(
      operarioId,
      activePeriod.periodoId,
    );
    if (rutas.length === 0) {
      throw new ForbiddenException(
        'No tenés rutas asignadas en el período activo',
      );
    }

    const activeHistorial = lectura.medidor?.historial?.[0];
    const contrato = activeHistorial?.contrato ?? null;
    if (!contrato) {
      throw new NotFoundException(
        'No se encontró un contrato activo para esta lectura',
      );
    }

    const lecturaPertenece = rutas.some((ruta) => {
      const comunidadMatch = ruta.comunidadId === contrato.comunidadId;
      const sectorMatch =
        ruta.sectorId === null || ruta.sectorId === undefined
          ? true
          : ruta.sectorId === contrato.sectorId;
      return comunidadMatch && sectorMatch;
    });

    if (!lecturaPertenece) {
      throw new ForbiddenException(
        'Esta lectura no pertenece a tu ruta asignada',
      );
    }

    // 2. Delegate to the unified UpdateReadingUseCase with state machine
    const updated = await this.updateReadingUseCase.execute(
      id,
      updateDto,
      EstadoLectura.POR_REVISION,
    );

    return toReadingResponse(updated)!;
  }

  /**
   * Instalar un medidor
   * POST /meters/:id/install
   * El medidor debe estar en estado PENDIENTE (asignado a un contrato).
   * Cambia el estado a INSTALADO y registra la fecha de instalación.
   */
  @ApiOperation({
    summary: 'Instalar medidor',
    description:
      'Cambia el estado del medidor de PENDIENTE a INSTALADO. El medidor debe haber sido asociado a un contrato previamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del medidor',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Medidor instalado',
    type: MeterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos - el medidor debe estar en estado PENDIENTE',
  })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'update')
  @Post(':id/install')
  async install(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<MeterResponseDto> {
    return toMeterResponse(await this.installUseCase.execute(id));
  }

  /**
   * Reportar daño de un medidor
   * POST /meters/:id/report-defect
   */
  @ApiOperation({
    summary: 'Reportar daño',
    description: 'Marca un medidor como dañado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del medidor',
    type: Number,
    example: 1,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Daño reportado',
    type: MeterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El medidor debe estar en estado INSTALADO',
  })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'update')
  @Post(':id/report-defect')
  async reportDefect(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<MeterResponseDto> {
    return toMeterResponse(await this.reportDefectUseCase.execute(id));
  }

  /**
   * Dar de baja un medidor
   * POST /meters/:id/decommission
   */
  @ApiOperation({
    summary: 'Dar de baja',
    description: 'Desactiva un medidor del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del medidor',
    type: Number,
    example: 1,
  })
  @ApiBody({
    schema: { example: { motivoBaja: 'Replacement' } },
    description: 'Motivo de la baja',
  })
  @ApiResponse({
    status: 200,
    description: 'Medidor dado de baja',
    type: MeterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El medidor debe estar en estado DANADO',
  })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'delete')
  @Post(':id/decommission')
  async decommission(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: DecommissionMeterDto,
  ): Promise<MeterResponseDto> {
    return toMeterResponse(
      await this.decommissionUseCase.execute(id, dto.motivoBaja),
    );
  }

  /**
   * Sincronización offline PWA — devuelve todos los medidores sin paginación
   * GET /meters/sync
   */
  @ApiOperation({
    summary: 'Sync offline de medidores',
    description:
      'Retorna los medidores del operador según sus rutas asignadas en el período activo',
  })
  @ApiResponse({ status: 200, description: 'Lista de medidores del operador' })
  @RequiredPermission('meters', 'read')
  @Get('sync')
  async syncAll(@CurrentUser() user: JwtPayload): Promise<MeterResponseDto[]> {
    const operarioId = Number(user.sub);
    const meters = await this.syncAllUseCase.execute(operarioId);
    return meters.map((m) => toMeterResponse(m));
  }
}
