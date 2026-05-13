import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total de registros encontrados' })
  total: number;

  @ApiProperty({ description: 'Última página disponible' })
  lastPage: number;

  @ApiProperty({ description: 'Página actual' })
  currentPage: number;

  @ApiProperty({ description: 'Registros por página' })
  perPage: number;

  @ApiProperty({ description: 'Página anterior', nullable: true })
  prev: number | null;

  @ApiProperty({ description: 'Siguiente página', nullable: true })
  next: number | null;
}
