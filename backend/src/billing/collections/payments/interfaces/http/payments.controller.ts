import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { PaymentsService } from '../../application/payments.service';
import {
  ApplySaldoFavorDto,
  CreatePaymentDto,
} from '../dto/create-payment.dto';
import {
  AnnulPaymentDto,
  UpdatePaymentStateDto,
} from '../dto/update-payment-state.dto';
import {
  DailyCashSummaryQueryDto,
  FindAllPaymentsDto,
} from '../dto/find-all-payments.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { PaymentStateResponseDto } from '../dto/payment-state-response.dto';
import { BankResponseDto } from '../dto/bank-response.dto';
import { CardBrandResponseDto } from '../dto/card-brand-response.dto';
import { SaldoFavorResponseDto } from '../dto/saldo-favor-response.dto';

@ApiTags('payments')
@ApiBearerAuth()
@ApiExtraModels(PaymentResponseDto, PaginationMetaDto)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({
    summary: 'Crear pago',
    description:
      'Registra un pago con detalle de comprobantes, cuotas de convenio, saldos a favor o pagos libres.',
  })
  @ApiResponse({
    status: 201,
    description: 'Pago creado',
    type: PaymentResponseDto,
  })
  @RequiredPermission('payments', 'create')
  @Post()
  async create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: any,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.create(dto, this.getActor(user));
  }

  @ApiOperation({
    summary: 'Listar pagos',
    description:
      'Retorna pagos paginados con filtros por cliente, estado, banco y rango de fechas.',
  })
  @ApiPaginatedResponse(PaymentResponseDto)
  @RequiredPermission('payments', 'read')
  @Get()
  async findAll(
    @Query() query: FindAllPaymentsDto,
  ): Promise<PaginatedResult<PaymentResponseDto>> {
    return this.paymentsService.findAll(query);
  }

  @ApiOperation({
    summary: 'Catálogo de estados de pago',
    description: 'Lista los estados disponibles del enum EstadoPago.',
  })
  @ApiResponse({ status: 200, type: [PaymentStateResponseDto] })
  @RequiredPermission('payments', 'read')
  @Get('states')
  async findStates(): Promise<PaymentStateResponseDto[]> {
    return this.paymentsService.findPaymentStates();
  }

  @ApiOperation({
    summary: 'Catálogo de bancos',
    description: 'Lista los bancos disponibles para transferencias.',
  })
  @ApiResponse({ status: 200, type: [BankResponseDto] })
  @RequiredPermission('payments', 'read')
  @Get('banks')
  async findBanks(): Promise<BankResponseDto[]> {
    return this.paymentsService.findBankCatalog();
  }

  @ApiOperation({
    summary: 'Catálogo de tarjetas',
    description: 'Lista las marcas de tarjeta disponibles (crédito/débito).',
  })
  @ApiResponse({ status: 200, type: [CardBrandResponseDto] })
  @RequiredPermission('payments', 'read')
  @Get('cards')
  async findCardBrands(): Promise<CardBrandResponseDto[]> {
    return this.paymentsService.findCardBrandCatalog();
  }

  @ApiOperation({
    summary: 'Cuadro diario de caja',
    description:
      'Resume pagos registrados del día con desglose por tipo de detalle y tipo de comprobante.',
  })
  @ApiResponse({ status: 200, description: 'Resumen diario de caja' })
  @RequiredPermission('payments', 'read')
  @Get('cuadro-diario')
  async getDailyCashSummary(@Query() query: DailyCashSummaryQueryDto) {
    return this.paymentsService.getDailyCashSummary(query);
  }

  @ApiOperation({
    summary: 'Saldo a favor por cliente',
    description: 'Lista saldos a favor disponibles para aplicar.',
  })
  @ApiParam({ name: 'clienteId', type: String, example: '1' })
  @ApiResponse({ status: 200, type: [SaldoFavorResponseDto] })
  @RequiredPermission('payments', 'read')
  @Get('cliente/:clienteId/saldo-favor')
  async findSaldoFavor(
    @Param('clienteId', ParseBigIntPipe) clienteId: bigint,
  ): Promise<SaldoFavorResponseDto[]> {
    return this.paymentsService.findSaldoFavorByCliente(clienteId);
  }

  @ApiOperation({
    summary: 'Aplicar saldo a favor',
    description:
      'Aplica un saldo disponible a un comprobante o cuota de convenio.',
  })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  @RequiredPermission('payments', 'update')
  @Post('apply-saldo-favor')
  async applySaldoFavor(
    @Body() dto: ApplySaldoFavorDto,
    @CurrentUser() user: any,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.applySaldoFavor(dto, this.getActor(user));
  }

  @ApiOperation({
    summary: 'Obtener pago por ID',
    description: 'Retorna un pago con su detalle y saldos generados.',
  })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  @RequiredPermission('payments', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Cambiar estado de pago',
    description:
      'Ejecuta transición PENDIENTE → REGISTRADO/ANULADO o REGISTRADO → ANULADO.',
  })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  @RequiredPermission('payments', 'update')
  @Patch(':id/state')
  async updateState(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdatePaymentStateDto,
    @CurrentUser() user: any,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.updateState(id, dto, this.getActor(user));
  }

  @ApiOperation({
    summary: 'Anular pago',
    description:
      'Anula el pago con soft delete y revierte cuotas o saldos generados.',
  })
  @ApiParam({ name: 'id', type: String, example: '1' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  @RequiredPermission('payments', 'delete')
  @Delete(':id')
  async annul(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: AnnulPaymentDto,
    @CurrentUser() user: any,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.annul(id, {
      motivoAnulacion: dto.motivoAnulacion,
      anuladoPor: this.getActor(user),
    });
  }

  private getActor(user: any): string {
    return user?.email ?? user?.sub?.toString() ?? 'SYSTEM';
  }
}
