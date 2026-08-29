import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoRuta, TipoRuta } from 'src/shared/enums';
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
  @Min(1)
  operarioId?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  comunidadId?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  periodoId?: number;

  @ApiProperty({ required: false, enum: TipoRuta })
  @IsOptional()
  @IsEnum(TipoRuta)
  tipoRuta?: TipoRuta;
}
