import { Type } from "class-transformer";
import { IsIn, IsOptional, IsString } from "class-validator";

export class SearchClientDto {
  @IsIn(['identificacion', 'nombreCompleto'])
  tipo!: 'identificacion' | 'nombreCompleto';

  @IsString()
  valor!: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}