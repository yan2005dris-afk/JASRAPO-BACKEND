import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export class TariffCategoryFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por nombre de la categoría' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    description:
      'Buscar por nombre o descripción de la categoría (los campos visibles del listado)',
    example: 'residencial',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
