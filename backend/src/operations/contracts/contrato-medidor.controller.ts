import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContratoMedidorService } from './contrato-medidor.service';
import { CrearContratoMedidorDto } from './dto/create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from './dto/update-contrato-medidor.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/identity/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('contracts')
export class ContratoMedidorController {
  constructor(
    private readonly contratoMedidorService: ContratoMedidorService,
  ) {}

  @ApiOperation({
    summary: 'Crear contrato',
    description: 'Registra un nuevo contrato con medidor',
  })
  @ApiBody({ type: CrearContratoMedidorDto, description: 'Datos del contrato' })
  @ApiResponse({ status: 201, description: 'Contrato creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso contracts:create' })
  @RequiredPermission('contracts', 'create')
  @Post()
  crear(@Body() createDto: CrearContratoMedidorDto) {
    return this.contratoMedidorService.crearContrato(createDto);
  }

  @ApiOperation({
    summary: 'Listar contratos',
    description: 'Retorna lista de contratos',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Registros a omitir',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    description: 'Límite de registros',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'contratoId',
    description: 'Filtrar por ID de contrato',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'medidorId',
    description: 'Filtrar por ID de medidor',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Lista de contratos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('contracts', 'read')
  @Get()
  buscarContratos(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('contratoId') contratoId?: string,
    @Query('medidorId') medidorId?: string,
  ) {
    const where: any = {};
    if (contratoId) where.contratoId = BigInt(contratoId);
    if (medidorId) where.medidorId = BigInt(medidorId);
    return this.contratoMedidorService.buscarContratos({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      where,
    });
  }

  @ApiOperation({
    summary: 'Obtener contrato',
    description: 'Retorna un contrato por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Contrato encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'read')
  @Get(':id')
  buscarContrato(@Param('id') id: string) {
    return this.contratoMedidorService.buscarContrato(BigInt(id));
  }

  @ApiOperation({
    summary: 'Actualizar contrato',
    description: 'Actualiza un contrato',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato',
    type: String,
    example: '1',
  })
  @ApiBody({
    type: ActualizarContratoMedidorDto,
    description: 'Datos a actualizar',
  })
  @ApiResponse({ status: 200, description: 'Contrato actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso contracts:update' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'update')
  @Patch(':id')
  actualizarContrato(
    @Param('id') id: string,
    @Body() updateDto: ActualizarContratoMedidorDto,
  ) {
    return this.contratoMedidorService.actualizar(BigInt(id), updateDto);
  }

  @ApiOperation({
    summary: 'Finalizar vínculo',
    description: 'Finaliza el vínculo entre contrato y medidor',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Vínculo finalizado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'update')
  @Post(':id/finalize')
  finalizarVinculo(@Param('id') id: string) {
    return this.contratoMedidorService.finalizarVinculo(BigInt(id));
  }

  @ApiOperation({
    summary: 'Eliminar contrato',
    description: 'Elimina un contrato (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato',
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Contrato eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso contracts:delete' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'delete')
  @Delete(':id')
  eliminarContrato(@Param('id') id: string) {
    return this.contratoMedidorService.eliminar(BigInt(id));
  }
}
