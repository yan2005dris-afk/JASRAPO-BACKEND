import {
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export class FilterReadingsDto extends PaginationDto {
  @ApiProperty({
    description: 'Tipo de ruta para filtrar lecturas elegibles',
    enum: ['LECTURA', 'RECONEXION'],
  })
  @IsNotEmpty()
  @IsIn(['LECTURA', 'RECONEXION'])
  tipoRuta!: 'LECTURA' | 'RECONEXION';

  @ApiProperty({
    description: 'ID de la comunidad',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  comunidadId!: number;

  @ApiProperty({
    description: 'ID del sector (opcional)',
    required: false,
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sectorId?: number;

  @ApiProperty({
    description: 'ID del periodo (opcional)',
    required: false,
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  periodoId?: number;

  @ApiProperty({
    description: 'Buscar por número de guía o nombre de cliente',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
