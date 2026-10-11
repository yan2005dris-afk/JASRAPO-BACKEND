import { IsNumberString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkLecturaDto {
  @ApiProperty({
    description:
      'ID de la lectura a vincular (bigint serializado como string numérico entero)',
    example: '100',
  })
  @IsNumberString(
    {},
    { message: 'lecturaId debe ser una cadena numérica válida' },
  )
  @Matches(/^\d+$/, {
    message: 'lecturaId debe ser un entero positivo sin signo',
  })
  lecturaId: string;
}
