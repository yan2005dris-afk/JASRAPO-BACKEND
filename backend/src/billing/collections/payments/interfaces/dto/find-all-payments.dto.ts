import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Banco, EstadoPago, TarjetaCredito } from 'src/generated/prisma/enums';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export class FindAllPaymentsDto extends PaginationDto {
  @ApiPropertyOptional({ example: '1', description: 'Filtrar por cliente' })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'clienteId debe ser un ID numérico' })
  clienteId?: string;

  @ApiPropertyOptional({
    enum: EstadoPago,
    description: 'Filtrar por estado de pago',
  })
  @IsOptional()
  @IsEnum(EstadoPago)
  estadoPago?: EstadoPago;

  @ApiPropertyOptional({
    enum: Banco,
    description: 'Filtrar por banco de origen',
  })
  @IsOptional()
  @IsEnum(Banco)
  banco?: Banco;

  @ApiPropertyOptional({
    enum: TarjetaCredito,
    description: 'Filtrar por marca de tarjeta',
  })
  @IsOptional()
  @IsEnum(TarjetaCredito)
  tarjetaCredito?: TarjetaCredito;

  @ApiPropertyOptional({ example: '2026-06-01', description: 'Fecha desde' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2026-06-30', description: 'Fecha hasta' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}

export class DailyCashSummaryQueryDto {
  @ApiPropertyOptional({
    example: '2026-06-18',
    description: 'Día a consultar; por defecto hoy',
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional({ example: '1', description: 'Filtrar por caja' })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'cajaId debe ser un ID numérico' })
  cajaId?: string;
}
