import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { EstadoPago } from 'src/shared/enums';

export class UpdatePaymentStateDto {
  @ApiProperty({ enum: EstadoPago, example: 'REGISTRADO' })
  @IsEnum(EstadoPago)
  estadoPago: EstadoPago;

  @ApiProperty({
    example: 'Transferencia confirmada en banco',
    description: 'Motivo del cambio (obligatorio si estadoPago = ANULADO)',
  })
  @ValidateIf((o) => o.estadoPago === EstadoPago.ANULADO)
  @IsNotEmpty({ message: 'motivo es obligatorio cuando se anula un pago' })
  @IsString()
  motivo?: string;
}

export class AnnulPaymentDto {
  @ApiProperty({ example: 'Transferencia no confirmada' })
  @IsString()
  @IsNotEmpty()
  motivoAnulacion: string;
}
