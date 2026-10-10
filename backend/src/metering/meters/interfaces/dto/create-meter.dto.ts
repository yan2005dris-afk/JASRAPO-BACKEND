import { MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';

export class CreateMeterDto {
  @ApiProperty({
    description: 'Marca del medidor',
    example: 'Itron',
    required: true,
  })
  @IsNotEmptyString()
  @MaxLength(100)
  marca: string;

  @ApiProperty({
    description: 'Modelo del medidor',
    example: 'CX1000',
    required: true,
  })
  @IsNotEmptyString()
  @MaxLength(100)
  modelo: string;

  @ApiProperty({
    description: 'Número de serie único del medidor',
    example: 'SN-2024-001234',
    required: true,
  })
  @IsNotEmptyString()
  @MaxLength(50)
  serie: string;
}
