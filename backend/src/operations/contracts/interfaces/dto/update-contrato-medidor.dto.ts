import {
  IsNumberString,
  IsOptional,
  IsNumber,
  IsString,
  IsIn,
  Min,
} from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';
import { EstadoContrato } from 'src/shared/enums';

export class ActualizarContratoMedidorDto {
  @IsOptional()
  @IsString()
  @IsIn(Object.values(EstadoContrato))
  estado?: string;
  @IsOptional() @IsString() @IsNotEmptyString() direccionSuministro?: string;
  @IsOptional() @IsNumberString() sectorId?: string;
  @IsOptional() @IsNumberString() medidorId?: string;
  @IsOptional() @IsNumber() @Min(0) lecturaInicial?: number;
}
