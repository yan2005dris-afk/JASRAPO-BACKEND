import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBusquedaPublicaDto {
  @IsIn(['cliente', 'contrato', 'global'])
  tipo!: 'cliente' | 'contrato' | 'global';

  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(2)
  valor!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
