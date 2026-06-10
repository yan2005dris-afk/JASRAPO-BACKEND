import { IsDateString, IsOptional, IsString } from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class ActualizarContratoMedidorDto {
  @IsOptional() @IsDateString() fechaFin?: string | Date;
  @IsOptional() @IsString() @IsNotEmptyString() motivoCambio?: string;
}
