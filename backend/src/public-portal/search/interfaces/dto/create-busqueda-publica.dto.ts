import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBusquedaPublicaDto {
  @ApiProperty({
    description:
      'Tipo de búsqueda: "cliente" busca por identificación o nombre, "contrato" busca por número de guía, "global" busca en ambos.',
    enum: ['cliente', 'contrato', 'global'],
    example: 'cliente',
  })
  @IsIn(['cliente', 'contrato', 'global'])
  tipo!: 'cliente' | 'contrato' | 'global';

  @ApiProperty({
    description: 'Texto a buscar',
    example: '0912345678',
    minLength: 2,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  @IsString()
  @MinLength(2)
  valor!: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Resultados por página',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
