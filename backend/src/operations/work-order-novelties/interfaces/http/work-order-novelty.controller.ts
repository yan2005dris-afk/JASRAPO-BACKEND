import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { createImageFileFilter } from 'src/infrastructure/common/utils/evidence-upload.util';
import { MAX_UPLOAD_SIZE_BYTES } from 'src/infrastructure/config/app.constants';
import { WorkOrderNoveltyService } from '../../application/services/work-order-novelty.service';
import { CreateWorkOrderNoveltyDto } from '../dto/create-work-order-novelty.dto';
import { UpdateWorkOrderNoveltyDto } from '../dto/update-work-order-novelty.dto';
import { ResponseWorkOrderNoveltyDto } from '../dto/response-work-order-novelty.dto';
import { EstadoNovedad } from 'src/shared/enums';

@ApiTags('work-order-novelties')
@ApiBearerAuth()
@Controller('work-order-novelties')
export class WorkOrderNoveltyController {
  constructor(private readonly service: WorkOrderNoveltyService) {}

  @ApiOperation({ summary: 'Crear novedad en orden de trabajo' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiResponse({ status: 201, type: ResponseWorkOrderNoveltyDto })
  @RequiredPermission('work-order-novelties', 'create')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: createImageFileFilter(),
    }),
  )
  async create(
    @Body() dto: CreateWorkOrderNoveltyDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseWorkOrderNoveltyDto> {
    const created = await this.service.create(dto, file);
    return ResponseWorkOrderNoveltyDto.fromEntity(created);
  }

  @ApiOperation({ summary: 'Listar novedades de órdenes de trabajo' })
  @RequiredPermission('work-order-novelties', 'read')
  @Get()
  async findAll(
    @Query('ordenTrabajoId') ordenTrabajoId?: string,
    @Query('lecturaId') lecturaId?: string,
    @Query('estado') estado?: EstadoNovedad,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.service.findAll({
      ordenTrabajoId: ordenTrabajoId ? BigInt(ordenTrabajoId) : undefined,
      lecturaId: lecturaId ? BigInt(lecturaId) : undefined,
      estado,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return {
      data: result.data.map((e) => ResponseWorkOrderNoveltyDto.fromEntity(e)),
      total: result.total,
    };
  }

  @ApiOperation({ summary: 'Consultar novedad por ID' })
  @RequiredPermission('work-order-novelties', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<ResponseWorkOrderNoveltyDto> {
    const item = await this.service.findById(id);
    return ResponseWorkOrderNoveltyDto.fromEntity(item);
  }

  @ApiOperation({ summary: 'Actualizar o transicionar estado de novedad' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @RequiredPermission('work-order-novelties', 'update')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: createImageFileFilter(),
    }),
  )
  async update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateWorkOrderNoveltyDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseWorkOrderNoveltyDto> {
    const actorUserId = req.user?.usuarioId;
    const updated = await this.service.update(id, dto, file, actorUserId);
    return ResponseWorkOrderNoveltyDto.fromEntity(updated);
  }
}
