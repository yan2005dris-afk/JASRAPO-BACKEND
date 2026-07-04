import { ApiProperty } from '@nestjs/swagger';
import { EstadoPago } from 'src/generated/prisma/enums';

export class PaymentStateResponseDto {
  @ApiProperty({ enum: EstadoPago, example: 'PENDIENTE' })
  codigo: EstadoPago;
}
