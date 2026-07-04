import { ApiProperty } from '@nestjs/swagger';
import { TarjetaCredito } from 'src/generated/prisma/enums';

export class CardBrandResponseDto {
  @ApiProperty({ enum: TarjetaCredito, example: 'VISA' })
  codigo: TarjetaCredito;

  @ApiProperty({ example: 'Visa' })
  descripcion: string;
}
