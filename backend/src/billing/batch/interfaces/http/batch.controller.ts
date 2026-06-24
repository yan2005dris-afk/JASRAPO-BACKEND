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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { GenerateBatchDto } from '../dto/generate-batch.dto';
import { BatchService } from '../../application/batch.service';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { SendBatchEmailsUseCase } from '../../application/use-cases/send-batch-emails.use-case';

@ApiTags('batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('batches')
export class BatchController {
  constructor(
    private readonly batchService: BatchService,
    private readonly sendBatchEmails: SendBatchEmailsUseCase,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new batch of pre-invoices' })
  @RequiredPermission('batches', 'create')
  async generate(@Body() dto: GenerateBatchDto) {
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
