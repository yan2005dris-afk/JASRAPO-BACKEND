import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { EstadoOrdenTrabajo } from 'src/shared/enums';

export class FindOrdenesByRutaDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado de orden',
    enum: EstadoOrdenTrabajo,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoOrdenTrabajo)
  estado?: EstadoOrdenTrabajo;
}
