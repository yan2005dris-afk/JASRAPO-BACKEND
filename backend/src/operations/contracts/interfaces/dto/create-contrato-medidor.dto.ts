import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class CrearContratoMedidorDto {
  @IsNotEmpty() contratoId: string | number;
  @IsNotEmpty() medidorId: string | number;
  @IsOptional() lecturaInicial?: number;
  @IsOptional() @IsDateString() fechaInicio?: string | Date;
  @IsOptional() @IsString() @IsNotEmptyString() motivoCambio?: string;
}
