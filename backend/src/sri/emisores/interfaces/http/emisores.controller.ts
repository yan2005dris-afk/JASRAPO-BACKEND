import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Logger,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmisoresService } from '../../application/emisores.service';
import {
  CreateEmisorDto,
  UpdateEmisorDto,
  EmisorResponseDto,
} from '../dto';
import { JwtAuthGuard } from '../../../../identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';

@ApiTags('[En Desarrollo] Emisores')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('emisores')
export class EmisoresController {
  private readonly logger = new Logger(EmisoresController.name);

  constructor(private readonly emisoresService: EmisoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los emisores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de emisores',
    type: [EmisorResponseDto],
  })
  @RequiredPermission('emisores', 'read')
  async findAll(): Promise<EmisorResponseDto[]> {
    return this.emisoresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un emisor por ID' })
  @ApiResponse({
    status: 200,
    description: 'Emisor encontrado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  @RequiredPermission('emisores', 'read')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmisorResponseDto> {
    return this.emisoresService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo emisor' })
  @ApiResponse({
    status: 201,
    description: 'Emisor creado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'RUC ya existe' })
  @RequiredPermission('emisores', 'create')
  async create(@Body() dto: CreateEmisorDto): Promise<EmisorResponseDto> {
    return this.emisoresService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un emisor' })
  @ApiResponse({
    status: 200,
    description: 'Emisor actualizado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  @RequiredPermission('emisores', 'update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmisorDto,
  ): Promise<EmisorResponseDto> {
    return this.emisoresService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Inactivar un emisor (eliminación lógica)' })
  @ApiResponse({
    status: 200,
    description: 'Emisor inactivado',
    type: EmisorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Emisor ya está inactivo' })
  @ApiResponse({ status: 404, description: 'Emisor no encontrado' })
  @RequiredPermission('emisores', 'delete')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmisorResponseDto> {
    return this.emisoresService.delete(id);
  }
}
