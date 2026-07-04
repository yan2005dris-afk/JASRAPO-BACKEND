import { ApiProperty } from '@nestjs/swagger';
import { Banco } from 'src/generated/prisma/enums';

export class BankResponseDto {
  @ApiProperty({ enum: Banco, example: 'PICHINCHA' })
  codigo: Banco;

  @ApiProperty({ example: 'Banco Pichincha' })
  descripcion: string;
}
