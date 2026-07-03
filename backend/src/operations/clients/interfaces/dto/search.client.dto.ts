import { Type } from 'class-transformer';
import { IsIn, IsOptional, MaxLength } from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class SearchClientDto {
  @IsIn(['identificacion', 'nombreCompleto'])
  tipo!: 'identificacion' | 'nombreCompleto';

  @IsNotEmptyString()
  @MaxLength(100)
  valor!: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
