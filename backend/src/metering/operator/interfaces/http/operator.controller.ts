import {
  BadRequestException,
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Post,
  ParseEnumPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import type { JwtPayload } from 'src/identity/auth/application/types/jwt.types';
import { GetOperatorReadingsUseCase } from '../../application/use-cases/get-operator-readings.use-case';
import { UpdateOperatorReadingUseCase } from '../../application/use-cases/update-operator-reading.use-case';
import { UpdateOperatorWorkOrderUseCase } from '../../application/use-cases/update-operator-work-order.use-case';
import { UpdateOperatorWorkOrderDto } from '../dto/update-operator-work-order.dto';
import { UpdateOperatorReadingDto } from '../dto/update-operator-reading.dto';
import { OPERATOR_IMAGE_UPLOAD_OPTIONS } from './operator-image-upload.options';
import { OrderWorkResponseDto } from 'src/operations/routes/interfaces/dto/orden-trabajo-response.dto';
import { ResponseReadingDto } from 'src/metering/readings/interfaces/dto/response-reading.dto';
import { MeterResponseDto } from 'src/metering/meters/interfaces/dto/meter-response.dto';
import { SyncAllUseCase } from '../../application/use-cases/sync-all.use-case';
import { DecommissionMeterDto } from '../dto/decommission-meter.dto';
import { GetOperatorRoutesUseCase } from '../../application/use-cases/get-operator-routes.use-case';
import { UpdateRouteStateUseCase } from '../../application/use-cases/update-route-state.use-case';
import { UpdateRouteStateDto } from '../../interfaces/dto/update-route-state.dto';
import { OperatorRouteResponseDto } from '../../interfaces/dto/operator-route-response.dto';
import { OperatorReadingAnomalyResponseDto } from '../../interfaces/dto/operator-reading-anomaly-response.dto';
import { TipoRuta } from 'src/shared/enums';
import { ReportDefectUseCase } from '../../application/use-cases/report-defect.use-case';
import { DecommissionMeterUseCase } from '../../application/use-cases/decommission-meter.use-case';
import { GetOperatorReadingsWithAnomaliesUseCase } from '../../application/use-cases/get-operator-readings-with-anomalies.use-case';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import {
  uploadReadingPhoto,
  rollbackReadingPhoto,
} from '../../application/reading-upload.helper';

@ApiTags('operator')
@ApiBearerAuth()
@Controller('operator')
export class OperatorController {
  constructor(
    private readonly getOperatorReadingsUseCase: GetOperatorReadingsUseCase,
    private readonly updateOperatorReadingUseCase: UpdateOperatorReadingUseCase,
    private readonly updateOperatorWorkOrderUseCase: UpdateOperatorWorkOrderUseCase,
    private readonly reportDefectUseCase: ReportDefectUseCase,
    private readonly decommissionMeterUseCase: DecommissionMeterUseCase,
    private readonly syncAllUseCase: SyncAllUseCase,
    private readonly getOperatorRoutesUseCase: GetOperatorRoutesUseCase,
    private readonly updateRouteStateUseCase: UpdateRouteStateUseCase,
    private readonly getOperatorReadingsWithAnomaliesUseCase: GetOperatorReadingsWithAnomaliesUseCase,
    private readonly storageService: StorageService,
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
    const operarioId = this.getAuthenticatedOperatorId(user);
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
    type: [OperatorReadingAnomalyResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'No hay período activo' })
  @RequiredPermission('lecturas', 'read')
  @Get('readings/anomalies')
  async getReadingsWithAnomalies(
    @CurrentUser() user: JwtPayload,
  ): Promise<OperatorReadingAnomalyResponseDto[]> {
    const operarioId = this.getAuthenticatedOperatorId(user);
    const readings =
      await this.getOperatorReadingsWithAnomaliesUseCase.execute(operarioId);
    return readings.map((r) => OperatorReadingAnomalyResponseDto.fromEntity(r));
  }

  @ApiOperation({
    summary: 'Actualizar lectura del operario',
    description:
      'Permite al operario actualizar una lectura de su ruta. Acepta multipart/form-data: ' +
      'Todos los campos del DTO como strings de formulario más un archivo opcional `foto`. La foto se guarda como evidenciaFotoUrl (clave de objeto RustFS) en la orden de trabajo vinculada.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'ID de la lectura',
    type: Number,
    example: 1,
  })
  @ApiBody({
    description:
      'Datos de lectura + foto opcional (multipart/form-data). `foto` es evidencia de la orden de trabajo y se persiste como clave de objeto RustFS.',
    schema: {
      type: 'object',
      properties: {
        lecturaActual: { type: 'number' },
        lecturaAnterior: { type: 'number' },
        fecha: { type: 'string' },
        lecturaInicial: { type: 'boolean' },
        descripcionAnomalia: { type: 'string' },
        foto: { type: 'string', format: 'binary' },
      },
    },
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
  @UseInterceptors(FileInterceptor('foto', OPERATOR_IMAGE_UPLOAD_OPTIONS))
  @Patch('readings/:id')
  async updateOperatorReading(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdateOperatorReadingDto,
    @UploadedFile() foto?: Express.Multer.File,
  ): Promise<ResponseReadingDto> {
    const operarioId = this.getAuthenticatedOperatorId(user);
    let uploadedKey: string | undefined;
    if (foto) {
      uploadedKey = await uploadReadingPhoto(foto, this.storageService);
    }

    try {
      const updated = await this.updateOperatorReadingUseCase.execute(
        id,
        operarioId,
        updateDto,
        uploadedKey,
      );
      return ResponseReadingDto.fromEntity(updated)!;
    } catch (error) {
      if (uploadedKey) {
        await rollbackReadingPhoto(uploadedKey, this.storageService);
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Actualizar orden de trabajo del operario',
    description:
      'Actualiza una orden no relacionada con lecturas y sus datos de ejecución.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de trabajo',
    type: Number,
  })
  @ApiBody({
    description:
      'Datos de ejecución. `foto` es opcional y se persiste como clave de objeto RustFS en evidenciaFotoUrl.',
    schema: {
      type: 'object',
      properties: {
        estado: { type: 'string' },
        resultadoObservacion: { type: 'string' },
        completadoEn: { type: 'string', format: 'date-time' },
        estadoSellos: { type: 'string' },
        hayFugas: { type: 'boolean' },
        confirmacionRetiroSello: { type: 'boolean' },
        foto: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Orden actualizada',
    type: OrderWorkResponseDto,
  })
  @RequiredPermission('routes', 'update')
  @UseInterceptors(FileInterceptor('foto', OPERATOR_IMAGE_UPLOAD_OPTIONS))
  @Patch('work-orders/:id')
  async updateOperatorWorkOrder(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOperatorWorkOrderDto,
    @UploadedFile() foto?: Express.Multer.File,
  ): Promise<OrderWorkResponseDto> {
    const operarioId = this.getAuthenticatedOperatorId(user);
    let uploadedKey: string | undefined;
    if (foto) {
      uploadedKey = await uploadReadingPhoto(foto, this.storageService);
    }
    try {
      const entity = await this.updateOperatorWorkOrderUseCase.execute(
        id,
        operarioId,
        dto,
        uploadedKey,
      );
      return OrderWorkResponseDto.fromEntity(entity);
    } catch (error) {
      if (uploadedKey) {
        await rollbackReadingPhoto(uploadedKey, this.storageService);
      }
      throw error;
    }
  }

  /**
   * Reportar daño de un medidor y crear tarea de inspección
   * POST /operator/:id/report-defect
   */
  @ApiOperation({
    summary: 'Reportar daño',
    description: 'Marca un medidor como dañado (INSTALADO → DAÑADO).',
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
    @CurrentUser() user: JwtPayload,
  ): Promise<MeterResponseDto> {
    return MeterResponseDto.fromEntity(
      await this.reportDefectUseCase.execute(
        id,
        this.getAuthenticatedOperatorId(user),
      ),
    );
  }

  /**
   * Dar de baja un medidor y crear tarea de inspección
   * POST /operator/:id/decommission
   */
  @ApiOperation({
    summary: 'Dar de baja',
    description: 'Desactiva un medidor del sistema (DAÑADO → BAJA).',
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
    @CurrentUser() user: JwtPayload,
  ): Promise<MeterResponseDto> {
    return MeterResponseDto.fromEntity(
      await this.decommissionMeterUseCase.execute(
        id,
        dto.motivoBaja,
        this.getAuthenticatedOperatorId(user),
      ),
    );
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
    const operarioId = this.getAuthenticatedOperatorId(user);
    const meters = await this.syncAllUseCase.execute(operarioId);
    return meters.map((m) => MeterResponseDto.fromEntity(m));
  }

  // ── Route endpoints (field operator view) ────────────────────────────

  /**
   * Listar rutas del operario
   * GET /operator/routes
   */
  @ApiOperation({
    summary: 'Listar rutas del operario',
    description:
      'Retorna las rutas del período activo con sus órdenes de trabajo y paradas asignadas al operario autenticado',
  })
  @ApiQuery({
    name: 'tipoRuta',
    required: false,
    enum: TipoRuta,
    description: 'Filtrar rutas por tipo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de rutas del operario',
    type: [OperatorRouteResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'No hay período activo' })
  @RequiredPermission('routes', 'read')
  @Get('routes')
  async getOperatorRoutes(
    @CurrentUser() user: JwtPayload,
    @Query('tipoRuta', new ParseEnumPipe(TipoRuta, { optional: true }))
    tipoRuta?: TipoRuta,
  ): Promise<OperatorRouteResponseDto[]> {
    const operarioId = this.getAuthenticatedOperatorId(user);
    const routes = await this.getOperatorRoutesUseCase.execute(
      operarioId,
      tipoRuta,
    );
    return routes.map((route) => OperatorRouteResponseDto.fromEntity(route));
  }

  /**
   * Actualizar estado de una ruta
   * PATCH /operator/routes/:id/state
   */
  @ApiOperation({
    summary: 'Actualizar estado de ruta',
    description:
      'Permite al operario actualizar el estado de una ruta asignada',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la ruta',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateRouteStateDto })
  @ApiResponse({
    status: 200,
    description: 'Ruta actualizada',
    type: OperatorRouteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Transición inválida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Ruta no pertenece al operador' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  @RequiredPermission('routes', 'update')
  @Patch('routes/:id/state')
  async updateRouteState(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateRouteStateDto,
  ): Promise<OperatorRouteResponseDto> {
    const operarioId = this.getAuthenticatedOperatorId(user);
    const updated = await this.updateRouteStateUseCase.execute(
      id,
      operarioId,
      dto,
    );
    return OperatorRouteResponseDto.fromEntity(updated);
  }

  private getAuthenticatedOperatorId(user: JwtPayload): number {
    const operarioId = Number(user.sub);
    if (!Number.isSafeInteger(operarioId) || operarioId <= 0) {
      throw new BadRequestException(
        'El identificador del operador debe ser un entero positivo seguro',
      );
    }
    return operarioId;
  }
}
