import { IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
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

  @ApiPropertyOptional({
    description:
      'Buscar por número de guía, nombre, razón social o identificación del cliente',
    example: 'GUIA-1-0051',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  search?: string;
}
