import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export class TariffCategoryFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por nombre de la categoría' })
  @IsOptional()
  @IsString()
  nombre?: string;
}
