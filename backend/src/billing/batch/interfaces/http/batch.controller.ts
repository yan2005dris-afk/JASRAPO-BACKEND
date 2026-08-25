import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { GenerateBatchDto } from '../dto/generate-batch.dto';
import { BatchService } from '../../application/batch.service';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { SendBatchEmailsUseCase } from '../../application/use-cases/send-batch-emails.use-case';
import {
  BatchResponseDto,
  BatchGenerationResponseDto,
} from '../dto/batch-response.dto';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@ApiTags('batches')
@ApiBearerAuth()
@ApiExtraModels(BatchResponseDto, PaginationMetaDto)
@Controller('batches')
export class BatchController {
  constructor(
    private readonly batchService: BatchService,
    private readonly sendBatchEmails: SendBatchEmailsUseCase,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new batch of pre-invoices' })
  @ApiResponse({
    status: 201,
    description: 'Batch generated successfully',
    type: BatchGenerationResponseDto,
  })
  @RequiredPermission('batches', 'create')
  async generate(
    @Body() dto: GenerateBatchDto,
  ): Promise<BatchGenerationResponseDto> {
    return this.batchService.generate(dto);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Batch status catalog',
    description: 'Returns the list of available statuses for billing batches',
  })
  @ApiResponse({
    status: 200,
    description: 'List of batch statuses',
    type: [EnumStateDto],
  })
  @RequiredPermission('batches', 'read')
  async findAllStates(): Promise<EnumStateDto[]> {
    return this.batchService.findAllStates();
  }

  @Get()
  @ApiOperation({ summary: 'List all billing batches' })
  @ApiPaginatedResponse(BatchResponseDto)
  @RequiredPermission('batches', 'read')
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<BatchResponseDto>> {
    const result = await this.batchService.findAll(
      paginationDto.page,
      paginationDto.limit,
    );

    return {
      data: BatchResponseDto.fromEntityList(result.data),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get batch details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Batch found',
    type: BatchResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  @RequiredPermission('batches', 'read')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BatchResponseDto> {
    const entity = await this.batchService.findOne(id);
    return BatchResponseDto.fromEntity(entity);
  }

  @Post(':id/send-email')
  @ApiOperation({
    summary: 'Send planilla emails for all pre-invoices in a batch',
    description:
      'Finds all pre-invoices in the specified batch and queues planilla emails with generated PDFs',
  })
  @ApiResponse({ status: 200, description: 'Emails queued successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  @RequiredPermission('batches', 'update')
  async sendEmail(@Param('id', ParseIntPipe) id: number) {
    return this.sendBatchEmails.execute(id);
  }
}
