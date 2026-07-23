import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsString, MinLength } from 'class-validator';
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
}
