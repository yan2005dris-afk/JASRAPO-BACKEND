import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { GenerateBatchDto } from '../dto/generate-batch.dto';
import { BatchService } from '../../application/batch.service';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

@ApiTags('batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new batch of pre-invoices' })
  @RequiredPermission('batches', 'create')
  async generate(@Body() dto: GenerateBatchDto) {
    return this.batchService.generate(dto);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Batch status catalog',
    description:
      'Returns the list of available statuses for billing batches',
  })
  @RequiredPermission('batches', 'read')
  async findAllStates() {
    return this.batchService.findAllStates();
  }

  @Get()
  @ApiOperation({ summary: 'List all billing batches' })
  @RequiredPermission('batches', 'read')
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.batchService.findAll(paginationDto.page, paginationDto.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get batch details by ID' })
  @RequiredPermission('batches', 'read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batchService.findOne(id);
  }
}
