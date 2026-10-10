import {
  BadRequestException,
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
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
  type ApiResponseOptions,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import { ParseBigIntPipe } from 'src/common/pipes/parse-bigint.pipe';
import type { JwtPayload } from 'src/identity/auth/application/types/jwt.types';
import { UpdateOperatorWorkOrderUseCase } from '../../application/use-cases/update-operator-work-order.use-case';
import { UpdateOperatorWorkOrderDto } from '../dto/update-operator-work-order.dto';
import { OPERATOR_IMAGE_UPLOAD_OPTIONS } from './operator-image-upload.options';
import { OrderWorkResponseDto } from 'src/operations/routes/interfaces/dto/orden-trabajo-response.dto';
import { GetOperatorRoutesUseCase } from '../../application/use-cases/get-operator-routes.use-case';
import { UpdateRouteStateUseCase } from '../../application/use-cases/update-route-state.use-case';
import { UpdateRouteStateDto } from '../../interfaces/dto/update-route-state.dto';
import { OperatorRouteResponseDto } from '../../interfaces/dto/operator-route-response.dto';
import { TipoActividadCodes } from 'src/shared/enums';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { GetOperatorSyncManifestUseCase } from '../../application/use-cases/get-operator-sync-manifest.use-case';
import { GetOperatorActivityTypesUseCase } from '../../application/use-cases/get-operator-activity-types.use-case';
import { OperatorSyncManifestDto } from '../dto/operator-sync-manifest.dto';
import {
  uploadReadingPhoto,
  rollbackReadingPhoto,
  deleteOldReadingPhoto,
} from '../../application/reading-upload.helper';

const OPERATOR_ERROR_SCHEMA = {
  type: 'object',
  required: [
    'statusCode',
    'timestamp',
    'path',
    'method',
    'message',
    'code',
    'retryable',
    'correlationId',
  ],
  properties: {
    statusCode: { type: 'number', example: 400 },
    timestamp: { type: 'string', format: 'date-time' },
    path: { type: 'string', example: '/operator/readings' },
    method: { type: 'string', example: 'PATCH' },
    message: { type: 'string', example: 'Error de validación' },
    errors: {
      type: 'array',
      items: {
        oneOf: [
          { type: 'string' },
          {
            type: 'object',
            properties: {
              field: { type: 'string' },
              message: { type: 'string' },
              constraints: { type: 'array', items: { type: 'string' } },
            },
          },
        ],
      },
    },
    code: { type: 'string', example: 'VALIDATION_ERROR' },
    retryable: { type: 'boolean', example: false },
    correlationId: {
      type: 'string',
      format: 'uuid',
      example: '550e8400-e29b-41d4-a716-446655440000',
    },
  },
};

const operatorErrorResponse = (
  status: number,
  description: string,
): ApiResponseOptions => ({
  status,
  description,
  content: {
    'application/json': {
      schema: OPERATOR_ERROR_SCHEMA,
    },
  },
});

@ApiTags('operator')
@ApiBearerAuth()
@Controller('operator')
export class OperatorController {
  constructor(
    private readonly updateOperatorWorkOrderUseCase: UpdateOperatorWorkOrderUseCase,
    private readonly getOperatorRoutesUseCase: GetOperatorRoutesUseCase,
    private readonly updateRouteStateUseCase: UpdateRouteStateUseCase,
    private readonly storageService: StorageService,
    private readonly getOperatorSyncManifestUseCase: GetOperatorSyncManifestUseCase,
    private readonly getOperatorActivityTypesUseCase: GetOperatorActivityTypesUseCase,
  ) {}

  @ApiOperation({
    summary: 'Obtener tipos de actividad',
    description: 'Retorna la lista de tipos de actividad disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de actividad',
  })
  @ApiResponse(operatorErrorResponse(401, 'No autenticado'))
  @RequiredPermission('routes', 'read')
  @Get('activity-types')
  async getActivityTypes() {
    return this.getOperatorActivityTypesUseCase.execute();
  }

  @ApiOperation({
    summary: 'Actualizar orden de trabajo del operario',
    description:
      'Actualiza una orden no relacionada con lecturas y conserva su estado, observación y evidencia.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de trabajo',
    type: Number,
  })
  @ApiBody({
    description:
      'Datos de la orden. `foto` es opcional y se persiste como clave de objeto RustFS en evidenciaFotoUrl.',
    schema: {
      type: 'object',
      properties: {
        estado: { type: 'string' },
        resultadoObservacion: { type: 'string' },
        completadoEn: { type: 'string', format: 'date-time' },
        latitud: { type: 'number' },
        longitud: { type: 'number' },
        lecturaActual: { type: 'number' },
        lecturaAnterior: { type: 'number' },
        descripcionAnomalia: { type: 'string' },
        fechaLectura: { type: 'string', format: 'date-time' },
        foto: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Orden actualizada',
    type: OrderWorkResponseDto,
  })
  @ApiResponse(operatorErrorResponse(400, 'Validación o estado inválido'))
  @ApiResponse(operatorErrorResponse(401, 'No autenticado'))
  @ApiResponse(operatorErrorResponse(403, 'Orden fuera de la ruta asignada'))
  @ApiResponse(operatorErrorResponse(404, 'Orden no encontrada'))
  @ApiResponse(operatorErrorResponse(409, 'Conflicto de concurrencia'))
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
        uploadedKey
          ? (oldKey: string, newKey: string) =>
              deleteOldReadingPhoto(oldKey, newKey, this.storageService)
          : undefined,
      );
      return OrderWorkResponseDto.fromRow(entity);
    } catch (error) {
      if (uploadedKey) {
        await rollbackReadingPhoto(uploadedKey, this.storageService);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Manifiesto paginado de sincronización offline' })
  @ApiResponse({ status: 200, type: OperatorSyncManifestDto })
  @ApiResponse(
    operatorErrorResponse(
      409,
      'El alcance de rutas asignadas cambió durante la sincronización',
    ),
  )
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @RequiredPermission('operator-sync', 'read')
  @Get('sync/manifest')
  async syncManifest(
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<OperatorSyncManifestDto> {
    return this.getOperatorSyncManifestUseCase.execute(
      this.getAuthenticatedOperatorId(user),
      cursor,
      limit == null ? 100 : Number(limit),
    );
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
    enum: TipoActividadCodes,
    description: 'Filtrar rutas por tipo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de rutas del operario',
    type: [OperatorRouteResponseDto],
  })
  @ApiResponse(
    operatorErrorResponse(400, 'Identificador del operador o filtro inválido'),
  )
  @ApiResponse(operatorErrorResponse(401, 'No autenticado'))
  @ApiResponse(operatorErrorResponse(403, 'Sin permiso routes:read'))
  @ApiResponse(operatorErrorResponse(404, 'No hay período activo'))
  @RequiredPermission('routes', 'read')
  @Get('routes')
  async getOperatorRoutes(
    @CurrentUser() user: JwtPayload,
    @Query(
      'tipoRuta',
      new ParseEnumPipe(TipoActividadCodes, { optional: true }),
    )
    tipoRuta?: TipoActividadCodes,
  ): Promise<OperatorRouteResponseDto[]> {
    const operarioId = this.getAuthenticatedOperatorId(user);
    const routes = await this.getOperatorRoutesUseCase.execute(
      operarioId,
      tipoRuta,
    );
    return routes.map((route) => OperatorRouteResponseDto.fromRow(route));
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
  @ApiResponse(operatorErrorResponse(400, 'Validación o transición inválida'))
  @ApiResponse(operatorErrorResponse(401, 'No autenticado'))
  @ApiResponse(operatorErrorResponse(403, 'Ruta no pertenece al operador'))
  @ApiResponse(operatorErrorResponse(404, 'Ruta no encontrada'))
  @ApiResponse(operatorErrorResponse(409, 'Conflicto de concurrencia'))
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
    return OperatorRouteResponseDto.fromRow(updated);
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
