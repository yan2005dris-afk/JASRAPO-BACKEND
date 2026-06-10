import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ActualizarContratoMedidorDto {
  @IsOptional() @IsDateString() fechaFin?: string | Date;
  @IsOptional() @IsString() motivoCambio?: string;
}
