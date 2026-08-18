import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { SistemaConfigService } from './sistema-config.service';
import {
  CreateSistemaConfigDto,
  SistemaConfigResponseDto,
  UpdateSistemaConfigDto,
} from './dto/sistema-config.dto';

@ApiTags('system-config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('system-configs')
export class SistemaConfigController {
  constructor(private readonly configService: SistemaConfigService) {}

  @ApiOperation({
    summary: 'Listar todas las configuraciones del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de configuraciones',
    type: [SistemaConfigResponseDto],
  })
  @RequiredPermission('configuraciones', 'read')
  @Get()
  async findAll(): Promise<SistemaConfigResponseDto[]> {
    return this.configService.getAll();
  }

  @ApiOperation({
    summary: 'Obtener una configuración por clave',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración encontrada',
    type: SistemaConfigResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  @RequiredPermission('configuraciones', 'read')
  @Get(':clave')
  async findOne(
    @Param('clave') clave: string,
  ): Promise<SistemaConfigResponseDto> {
    const record = await this.configService.getRecord(clave);
    if (!record) {
      throw new NotFoundException(
        `Configuración con clave "${clave}" no encontrada`,
      );
    }
    return record;
  }

  @ApiOperation({
    summary: 'Crear una nueva configuración',
  })
  @ApiResponse({
    status: 201,
    description: 'Configuración creada exitosamente',
    type: SistemaConfigResponseDto,
  })
  @RequiredPermission('configuraciones', 'create')
  @Post()
  async create(
    @Body() createDto: CreateSistemaConfigDto,
  ): Promise<SistemaConfigResponseDto> {
    return this.configService.create(createDto);
  }

  @ApiOperation({
    summary: 'Actualizar una configuración por clave',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración actualizada',
    type: SistemaConfigResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  @RequiredPermission('configuraciones', 'update')
  @Patch(':clave')
  async update(
    @Param('clave') clave: string,
    @Body() updateDto: UpdateSistemaConfigDto,
  ): Promise<SistemaConfigResponseDto> {
    const existing = await this.configService.getRecord(clave);
    if (!existing) {
      throw new NotFoundException(
        `Configuración con clave "${clave}" no encontrada`,
      );
    }
    return this.configService.update(clave, updateDto);
  }

  @ApiOperation({
    summary: 'Eliminar una configuración por clave',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración eliminada',
    type: SistemaConfigResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  @RequiredPermission('configuraciones', 'delete')
  @Delete(':clave')
  async delete(
    @Param('clave') clave: string,
  ): Promise<SistemaConfigResponseDto> {
    const existing = await this.configService.getRecord(clave);
    if (!existing) {
      throw new NotFoundException(
        `Configuración con clave "${clave}" no encontrada`,
      );
    }
    return this.configService.delete(clave);
  }
}
