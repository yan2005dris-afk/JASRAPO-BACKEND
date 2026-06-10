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
    description: 'Tipo de búsqueda',
    enum: ['identificacion', 'nombres', 'apellidos', 'nombreCompleto'],
    example: 'identificacion',
  })
  @IsIn(['identificacion', 'nombres', 'apellidos', 'nombreCompleto'])
  tipo!: 'identificacion' | 'nombres' | 'apellidos' | 'nombreCompleto';

  @ApiProperty({
    description: 'Texto a buscar',
    example: '12345678',
    minLength: 2,
  })
  @Transform(({ value }) => value?.trim())
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
