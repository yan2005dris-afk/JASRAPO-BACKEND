import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmisoresService } from '../../application/emisores.service';
import { CreateEmisorDto, UpdateEmisorDto, EmisorResponseDto } from '../dto';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@ApiTags('[SRI] Emisores')
@ApiBearerAuth('JWT')
@Controller('emisores')
export class EmisoresController {
  constructor(
    private readonly emisoresService: EmisoresService,
    private readonly logger: LoggerService,
  ) {}

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
