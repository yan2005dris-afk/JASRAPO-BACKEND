import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
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
  ApiQuery,
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
import { toReadingResponse } from 'src/metering/readings/types/readingMapper';
import { MeterResponseDto } from 'src/metering/meters/interfaces/dto/meter-response.dto';
import { toMeterResponse } from 'src/metering/meters/domain/types/metersMapper';
import { SyncAllUseCase } from '../../application/use-cases/sync-all.use-case';
import { DecommissionMeterDto } from './decommission-meter.dto';
import { GetOperatorTasksUseCase } from '../../application/use-cases/get-operator-tasks.use-case';
import { UpdateTaskStateUseCase } from '../../application/use-cases/update-task-state.use-case';
import { UpdateTaskDto } from '../../interfaces/dto/update-task.dto';
import { TaskResponseDto } from '../../interfaces/dto/task-response.dto';
import { TipoRuta } from 'src/shared/enums';
import { InstallMeterUseCase } from '../../application/use-cases/install-meter.use-case';
import { ReportDefectUseCase } from '../../application/use-cases/report-defect.use-case';
import { DecommissionMeterUseCase } from '../../application/use-cases/decommission-meter.use-case';
import { GetOperatorReadingsWithAnomaliesUseCase } from '../../application/use-cases/get-operator-readings-with-anomalies.use-case';

@ApiTags('operator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operator')
export class OperatorController {
  constructor(
    private readonly getOperatorReadingsUseCase: GetOperatorReadingsUseCase,
    private readonly updateOperatorReadingUseCase: UpdateOperatorReadingUseCase,
    private readonly installMeterUseCase: InstallMeterUseCase,
    private readonly reportDefectUseCase: ReportDefectUseCase,
    private readonly decommissionMeterUseCase: DecommissionMeterUseCase,
    private readonly syncAllUseCase: SyncAllUseCase,
    private readonly getOperatorTasksUseCase: GetOperatorTasksUseCase,
    private readonly updateTaskStateUseCase: UpdateTaskStateUseCase,
    private readonly getOperatorReadingsWithAnomaliesUseCase: GetOperatorReadingsWithAnomaliesUseCase,
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

  /**
   * List readings with pending anomalies for the operator
   * GET /operator/readings/anomalies
   */
  @ApiOperation({
    summary: 'Lecturas con anomalías pendientes',
    description:
      'Retorna las lecturas con estado CON_NOVEDAD que tienen anomalías en estado PENDIENTE, ' +
      'pertenecientes a las rutas activas del operario en el período activo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecturas con anomalías pendientes',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'No hay período activo' })
  @RequiredPermission('lecturas', 'read')
  @Get('readings/anomalies')
  async getReadingsWithAnomalies(
    @CurrentUser() user: JwtPayload,
  ): Promise<any[]> {
    const operarioId = Number(user.sub);
    return this.getOperatorReadingsWithAnomaliesUseCase.execute(operarioId);
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
    const updated = await this.updateOperatorReadingUseCase.execute(
      id,
      operarioId,
      updateDto,
    );
    return toReadingResponse(updated)!;
  }

  /**
   * Instalar un medidor y crear tarea de instalación
   * POST /operator/:id/install
   */
  @ApiOperation({
    summary: 'Instalar medidor',
    description:
      'Cambia el estado del medidor de PENDIENTE a INSTALADO y crea una tarea de instalación para el operario.',
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
    return toMeterResponse(await this.installMeterUseCase.execute(id));
  }

  /**
   * Reportar daño de un medidor y crear tarea de inspección
   * POST /operator/:id/report-defect
   */
  @ApiOperation({
    summary: 'Reportar daño',
    description: 'Marca un medidor como dañado y crea una tarea de inspección para el operario.',
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
   * Dar de baja un medidor y crear tarea de inspección
   * POST /operator/:id/decommission
   */
  @ApiOperation({
    summary: 'Dar de baja',
    description: 'Desactiva un medidor del sistema y crea una tarea de inspección para el operario.',
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
    return toMeterResponse(await this.decommissionMeterUseCase.execute(id, dto.motivoBaja));
  }

  /**
   * Sincronización offline PWA — devuelve todos los medidores sin paginación
   * GET /operator/sync
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

  // ── Task endpoints (field operator view) ─────────────────────────────

  /**
   * Listar tareas del operario
   * GET /operator/tasks
   */
  @ApiOperation({
    summary: 'Listar tareas del operario',
    description:
      'Retorna las tareas del período activo asignadas al operario autenticado',
  })
  @ApiQuery({
    name: 'tipoRuta',
    required: false,
    enum: TipoRuta,
    description: 'Filter tasks by route type',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas del operario',
    type: [TaskResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'No hay período activo' })
  @RequiredPermission('lecturas', 'read')
  @Get('tasks')
  async getOperatorTasks(
    @CurrentUser() user: JwtPayload,
    @Query('tipoRuta') tipoRuta?: string,
  ): Promise<TaskResponseDto[]> {
    const operarioId = Number(user.sub);
    return this.getOperatorTasksUseCase.execute(operarioId, tipoRuta);
  }

  /**
   * Actualizar estado de una tarea
   * PATCH /operator/tasks/:id
   */
  @ApiOperation({
    summary: 'Actualizar estado de tarea',
    description:
      'Permite al operario actualizar el estado de una tarea asignada',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la tarea (ruta)',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Tarea actualizada',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Transición inválida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Tarea no pertenece al operador' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @RequiredPermission('lecturas', 'update')
  @Patch('tasks/:id')
  async updateTaskState(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    const operarioId = Number(user.sub);
    return this.updateTaskStateUseCase.execute(id, operarioId, dto);
  }
}
