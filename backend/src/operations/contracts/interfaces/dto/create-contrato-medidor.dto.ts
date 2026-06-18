import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class CrearContratoMedidorDto {
  @IsNotEmpty() @IsNumberString() clienteId: string;
  @IsNotEmpty() @IsNumberString() categoriaTarifaId: string;
  @IsNotEmpty() @IsNumberString() medidorId: string;
  @IsNotEmpty() @IsString() @IsNotEmptyString() numeroGuia: string;
  @IsNotEmpty() @IsString() @IsNotEmptyString() direccionSuministro: string;
  @IsNotEmpty() @IsNumberString() comunidadId: string;
  @IsOptional() @IsNumberString() sectorId?: string;
  @IsOptional() @IsNumber() @Min(0) lecturaInicial?: number;
  @IsOptional() @IsString() estado?: string;
  @IsOptional() @IsString() creadoPor?: string;
}
