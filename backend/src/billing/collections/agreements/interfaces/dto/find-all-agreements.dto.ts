import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/shared/pagination/pagination.dto';
import { EstadoConvenio } from 'src/shared/enums';

export class FindAllAgreementsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de contrato',
    example: '1',
  })
  @IsOptional()
  @Matches(/^\d+$/, { message: 'contratoId must be a positive integer' })
  contratoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del convenio',
    enum: EstadoConvenio,
    example: EstadoConvenio.ACTIVO,
  })
  @IsOptional()
  @IsEnum(EstadoConvenio)
  estado?: EstadoConvenio;

  @ApiPropertyOptional({
    description:
      'Buscar por número de guía, nombre, razón social o identificación del cliente. ' +
      'Si el término es numérico también coincide con el ID de convenio o de contrato',
    example: 'GUIA-1-0051',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  search?: string;
}
