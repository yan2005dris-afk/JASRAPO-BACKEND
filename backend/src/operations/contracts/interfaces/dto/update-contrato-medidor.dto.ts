import {
  IsNumberString,
  IsOptional,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class ActualizarContratoMedidorDto {
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsString() @IsNotEmptyString() direccionSuministro?: string;
  @IsOptional() @IsNumberString() sectorId?: string;
  @IsOptional() @IsNumberString() medidorId?: string;
  @IsOptional() @IsNumber() @Min(0) lecturaInicial?: number;
}
