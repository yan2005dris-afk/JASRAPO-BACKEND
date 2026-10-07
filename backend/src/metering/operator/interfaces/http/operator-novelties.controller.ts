import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import type { JwtPayload } from 'src/identity/auth/application/types/jwt.types';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { createImageFileFilter } from 'src/infrastructure/common/utils/evidence-upload.util';
import { MAX_UPLOAD_SIZE_BYTES } from 'src/infrastructure/config/app.constants';
import { UpdateWorkOrderNoveltyDto } from 'src/operations/work-order-novelties/interfaces/dto/update-work-order-novelty.dto';
import { OperatorNoveltiesService } from '../../application/operator-novelties.service';

@ApiTags('operator-novelties')
@ApiBearerAuth()
@Controller('operator/novelties')
export class OperatorNoveltiesController {
  constructor(private readonly service: OperatorNoveltiesService) {}

  private operatorId(user: JwtPayload): number {
    const id = Number(user.sub);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException('Identificador del operador inválido');
    }
    return id;
  }

  @RequiredPermission('work-order-novelties', 'read')
  @Get()
  list(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page === undefined ? 1 : Number(page);
    const limitNumber = limit === undefined ? 100 : Number(limit);
    if (
      !Number.isSafeInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isSafeInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      throw new BadRequestException('Paginación inválida');
    }
    return this.service.list(this.operatorId(user), pageNumber, limitNumber);
  }

  @RequiredPermission('work-order-novelties', 'read')
  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseBigIntPipe) id: bigint,
  ) {
    return this.service.findOne(this.operatorId(user), id);
  }

  @RequiredPermission('work-order-novelties', 'update')
  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: createImageFileFilter(),
    }),
  )
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateWorkOrderNoveltyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.update(this.operatorId(user), id, dto, file);
  }
}
