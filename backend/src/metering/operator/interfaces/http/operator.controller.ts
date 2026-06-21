import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Post,
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
import { GetOperatorReadingsUseCase } from '../../application/use-cases/get-operator-readings.use-case';
import { UpdateOperatorReadingUseCase } from '../../application/use-cases/update-operator-reading.use-case';
import { ActualizarLecturaDto } from 'src/metering/readings/interfaces/dto/update-lectura.dto';
import { ResponseReadingDto } from 'src/metering/readings/interfaces/dto/response-reading.dto';
import { MeterResponseDto } from 'src/metering/meters/interfaces/dto/meter-response.dto';
import { toMeterResponse } from 'src/metering/meters/domain/types/metersMapper';
import { ReportDefectUseCase } from '../../../meters/application/use-cases/report-defect.use-case';
import { DecommissionMeterUseCase } from '../../../meters/application/use-cases/decommission-meter.use-case';
import { InstallMeterUseCase } from '../../../meters/application/use-cases/install-meter.use-case';
import { SyncAllUseCase } from '../../application/use-cases/sync-all.use-cate';

@ApiTags('operator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operator')
export class OperatorController {
  constructor(
    private readonly getOperatorReadingsUseCase: GetOperatorReadingsUseCase,
    private readonly updateOperatorReadingUseCase: UpdateOperatorReadingUseCase,
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
    type: ResponseReadingDto,
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
    return this.updateOperatorReadingUseCase.execute(id, operarioId, updateDto);
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
    @Body('motivoBaja') motivoBaja: string,
  ): Promise<MeterResponseDto> {
    return toMeterResponse(
      await this.decommissionUseCase.execute(id, motivoBaja),
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
  async syncAll(@CurrentUser() user: JwtPayload): Promise<any[]> {
    const operarioId = Number(user.sub);
    const meters = await this.syncAllUseCase.execute(operarioId);
    return meters.map((m) => ({
      medidorId: m.medidorId?.toString(),
      serie: m.serie,
      estado: m.estado,
      latitud: m.latitud,
      longitud: m.longitud,
      contratoId: m.contratoId?.toString() ?? null,
      clienteNombre: m.clienteNombre ?? null,
    }));
  }
}
