import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoPago } from 'src/generated/prisma/enums';

export class UpdatePaymentStateDto {
  @ApiProperty({ enum: EstadoPago, example: 'REGISTRADO' })
  @IsEnum(EstadoPago)
  estadoPago: EstadoPago;

  @ApiPropertyOptional({ example: 'Transferencia confirmada en banco' })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class AnnulPaymentDto {
  @ApiProperty({ example: 'Transferencia no confirmada' })
  @IsString()
  @IsNotEmpty()
  motivoAnulacion: string;
}
