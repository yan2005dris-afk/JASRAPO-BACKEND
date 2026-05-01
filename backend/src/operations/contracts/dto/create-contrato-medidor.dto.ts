import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CrearContratoMedidorDto {
  @IsNotEmpty() contratoId: string | number;
  @IsNotEmpty() medidorId: string | number;
  @IsOptional() @IsDateString() fechaInicio?: string | Date;
  @IsOptional() @IsString() motivoCambio?: string;
}
