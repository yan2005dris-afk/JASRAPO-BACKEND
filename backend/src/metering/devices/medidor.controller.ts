import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MedidorService } from './medidor.service';
import { CrearMedidorDto } from './dto/create-medidor.dto';
import { ActualizarMedidorDto } from './dto/update-medidor.dto';
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

@ApiTags('meters')
@ApiBearerAuth()
@Controller('meters')
export class MedidorController {
  constructor(private readonly medidoresService: MedidorService) {}

  /**
   * Crear un nuevo medidor
   */
  @ApiOperation({ summary: 'Crear medidor', description: 'Registra un nuevo medidor en el sistema' })
  @ApiBody({ type: CrearMedidorDto, description: 'Datos del medidor a crear' })
  @ApiResponse({ status: 201, description: 'Medidor creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso medidores:create' })
  @RequiredPermission('medidores', 'create')
  @Post()
  crear(@Body() createDto: CrearMedidorDto) {
    return this.medidoresService.crearMedidor(createDto);
  }

  /**
   * Listar todos los medidores con paginación
   */
  @ApiOperation({ summary: 'Listar medidores', description: 'Retorna lista de medidores con paginación' })
  @ApiQuery({ name: 'skip', description: 'Número de registros a omitir', required: false, type: Number })
  @ApiQuery({ name: 'take', description: 'Número máximo de registros', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de medidores obtenida' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('medidores', 'read')
  @Get()
  buscarTodos(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.medidoresService.buscarMedidores({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
    });
  }

  /**
   * Obtener un medidor por ID
   */
  @ApiOperation({ summary: 'Obtener medidor por ID', description: 'Retorna los datos de un medidor específico' })
  @ApiParam({ name: 'id', description: 'ID único del medidor', type: String, example: '1' })
  @ApiResponse({ status: 200, description: 'Medidor encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('medidores', 'read')
  @Get(':id')
  buscarUno(@Param('id') id: string) {
    return this.medidoresService.buscarMedidor(BigInt(id));
  }

  /**
   * Actualizar un medidor
   */
  @ApiOperation({ summary: 'Actualizar medidor', description: 'Actualiza los datos de un medidor' })
  @ApiParam({ name: 'id', description: 'ID único del medidor', type: String, example: '1' })
  @ApiBody({ type: ActualizarMedidorDto, description: 'Datos a actualizar' })
  @ApiResponse({ status: 200, description: 'Medidor actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso medidores:update' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('medidores', 'update')
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() updateDto: ActualizarMedidorDto) {
    return this.medidoresService.actualizarMedidor(BigInt(id), updateDto);
  }

  /**
   * Eliminar un medidor (Soft Delete)
   */
  @ApiOperation({ summary: 'Eliminar medidor', description: 'Marca un medidor como eliminado (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID único del medidor', type: String, example: '1' })
  @ApiResponse({ status: 200, description: 'Medidor eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso medidores:delete' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('medidores', 'delete')
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.medidoresService.eliminarMedidor(BigInt(id));
  }

  /**
   * Instalar un medidor en un contrato
   */
  @ApiOperation({ summary: 'Instalar medidor', description: 'Asocia un medidor a un contrato' })
  @ApiParam({ name: 'id', description: 'ID del medidor', type: String, example: '1' })
  @ApiBody({ schema: { example: { contratoId: '1' } }, description: 'ID del contrato' })
  @ApiResponse({ status: 200, description: 'Medidor instalado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Medidor o contrato no encontrado' })
  @RequiredPermission('medidores', 'update')
  @Post(':id/install')
  install(@Param('id') id: string, @Body('contratoId') contratoId: string) {
    return this.medidoresService.instalarMedidor(BigInt(id), BigInt(contratoId));
  }

  /**
   * Reportar daño de un medidor
   */
  @ApiOperation({ summary: 'Reportar daño', description: 'Marca un medidor como dañado' })
  @ApiParam({ name: 'id', description: 'ID del medidor', type: String, example: '1' })
  @ApiResponse({ status: 200, description: 'Daño reportado' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('medidores', 'update')
  @Post(':id/report-damage')
  reportDamage(@Param('id') id: string) {
    return this.medidoresService.reportarDano(BigInt(id));
  }

  /**
   * Facturar por promedio
   */
  @ApiOperation({ summary: 'Facturar por promedio', description: 'Genera facturación basada en promedio histórico' })
  @ApiParam({ name: 'id', description: 'ID del medidor', type: String, example: '1' })
  @ApiResponse({ status: 200, description: 'Facturación generada' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('medidores', 'update')
  @Post(':id/bill-average')
  billAverage(@Param('id') id: string) {
    return this.medidoresService.facturarPorPromedio(BigInt(id));
  }

  /**
   * Dar de baja un medidor
   */
  @ApiOperation({ summary: 'Dar de baja', description: 'Desactiva un medidor del sistema' })
  @ApiParam({ name: 'id', description: 'ID del medidor', type: String, example: '1' })
  @ApiBody({ schema: { example: { motivoBaja: 'Replacement' } }, description: 'Motivo de la baja' })
  @ApiResponse({ status: 200, description: 'Medidor dado de baja' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('medidores', 'delete')
  @Post(':id/decommission')
  decommission(@Param('id') id: string, @Body('motivoBaja') motivoBaja: string) {
    return this.medidoresService.darDeBaja(BigInt(id), motivoBaja);
  }
}
