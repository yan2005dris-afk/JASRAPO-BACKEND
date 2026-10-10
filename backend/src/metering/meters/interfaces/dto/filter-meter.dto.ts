import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/shared/pagination/pagination.dto';
import { EstadoMedidor } from 'src/shared/enums';

export class FilterMeterDto extends PaginationDto {
  @ApiPropertyOptional({ enum: EstadoMedidor })
  @IsOptional()
  @IsEnum(EstadoMedidor)
  @Transform(({ value }) => (value === '' ? undefined : value))
  estado?: EstadoMedidor;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  marca?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  modelo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  serie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  search?: string;
}
