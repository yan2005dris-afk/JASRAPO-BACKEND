import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoMedidor } from 'src/shared/enums';

export class ExportMeterDto {
  @ApiPropertyOptional({ enum: EstadoMedidor })
  @IsOptional()
  @IsEnum(EstadoMedidor)
  @Transform(({ value }) => (value === '' ? undefined : value))
  estado?: EstadoMedidor;

  @ApiPropertyOptional({ description: 'Busca por serie, marca o modelo' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  search?: string;
}
