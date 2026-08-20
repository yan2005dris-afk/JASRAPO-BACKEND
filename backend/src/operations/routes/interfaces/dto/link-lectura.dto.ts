import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkLecturaDto {
  @ApiProperty({
    description: 'ID de la lectura a vincular (bigint serializado como string)',
    example: '100',
  })
  @IsNotEmpty()
  @IsString()
  lecturaId: string;
}
