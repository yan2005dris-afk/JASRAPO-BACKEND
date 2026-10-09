import { ApiProperty } from '@nestjs/swagger';
import { TarjetaCredito } from 'src/shared/enums';

export class CardBrandResponseDto {
  @ApiProperty({ enum: TarjetaCredito, example: 'VISA' })
  codigo: TarjetaCredito;

  @ApiProperty({ example: 'Visa' })
  descripcion: string;
}
