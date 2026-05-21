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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmisoresService } from './emisores.service';
import { CreateEmisorDto, UpdateEmisorDto, EmisorResponseDto } from './dto';
import { JwtAuthGuard } from '../../../identity/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../infrastructure/common/guards/permissions.guard';

@ApiTags('Emisores')
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
  async findOne(
    @Param('id') id: string,
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
  async create(
    @Body() dto: CreateEmisorDto,
  ): Promise<EmisorResponseDto> {
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
  async update(
    @Param('id') id: string,
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
  async delete(
    @Param('id') id: string,
  ): Promise<EmisorResponseDto> {
    return this.emisoresService.delete(id);
  }
}
