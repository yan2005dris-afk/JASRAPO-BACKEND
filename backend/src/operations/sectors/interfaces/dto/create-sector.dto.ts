import { IsNumber, IsString } from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class CreateSectorDto {
  @IsNumber()
  comunidadId!: number;

  @IsString()
  @IsNotEmptyString()
  codigo!: string;

  @IsString()
  @IsNotEmptyString()
  nombre!: string;
}
