import { IsOptional, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../../infrastructure/common/dtos/pagination.dto';

export class FindAllAgreementsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de contrato',
    example: '1',
  })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'contratoId must be a positive integer' })
  contratoId?: string;
}
