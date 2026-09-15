import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoRuta, TipoActividadCodes } from 'src/shared/enums';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export class FindAllRoutesDto extends PaginationDto {
  @ApiProperty({ required: false, enum: EstadoRuta })
  @IsOptional()
  @IsEnum(EstadoRuta)
  estado?: EstadoRuta;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  operarioId?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  comunidadId?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodoId?: number;

  @ApiProperty({ required: false, enum: TipoActividadCodes })
  @IsOptional()
  @IsEnum(TipoActividadCodes)
  tipoRuta?: TipoActividadCodes;
}
