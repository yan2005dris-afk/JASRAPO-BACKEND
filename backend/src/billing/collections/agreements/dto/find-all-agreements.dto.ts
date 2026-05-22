import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../infrastructure/common/dtos/pagination.dto';

export class FindAllAgreementsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de contrato',
    example: '1',
  })
  @IsOptional()
  contratoId?: string;
}
