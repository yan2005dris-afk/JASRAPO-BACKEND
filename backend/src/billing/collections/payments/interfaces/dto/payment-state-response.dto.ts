import { ApiProperty } from '@nestjs/swagger';
import { EstadoPago } from 'src/shared/enums';

export class PaymentStateResponseDto {
  @ApiProperty({ enum: EstadoPago, example: 'PENDIENTE' })
  codigo: EstadoPago;
}
