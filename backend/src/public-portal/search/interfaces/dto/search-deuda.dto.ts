import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsString, Max, Min, MinLength } from 'class-validator';
import type { TipoBusquedaDeuda } from '../../domain/types/debt-search.types';

export class SearchDeudaDto {
  @ApiProperty({
    description: 'Tipo de búsqueda (identificacion o numeroGuia)',
    enum: ['identificacion', 'numeroGuia'],
    example: 'identificacion',
  })
  @IsIn(['identificacion', 'numeroGuia'])
  tipo!: TipoBusquedaDeuda;

  @ApiProperty({
    description:
      'Valor a buscar (número de identificación o número de guía/contrato)',
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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Resultados por página',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
