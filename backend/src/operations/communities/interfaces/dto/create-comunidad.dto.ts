import { IsNumber, MaxLength } from 'class-validator';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';

export class CreateComunidadDto {
  @IsNotEmptyString()
  @MaxLength(150)
  nombre: string;

  @IsNotEmptyString()
  @MaxLength(50)
  codigo: string;

  @IsNumber()
  porcentajeTasaSeguridad: number;
}
