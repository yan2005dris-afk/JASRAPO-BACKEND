import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMeterDto {
  @ApiProperty({
    description: 'Marca del medidor',
    example: 'Itron',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  marca: string;

  @ApiProperty({
    description: 'Modelo del medidor',
    example: 'CX1000',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  modelo: string;

  @ApiProperty({
    description: 'Número de serie único del medidor',
    example: 'SN-2024-001234',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  serie: string;
}
