import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DecommissionMeterDto {
  @ApiProperty({
    description: 'Motivo de la baja del medidor',
    example: 'Reemplazo por obsoleto',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivoBaja: string;
}
