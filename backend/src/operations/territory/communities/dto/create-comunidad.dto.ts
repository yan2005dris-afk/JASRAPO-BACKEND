import { IsNumber, IsString } from 'class-validator';

export class CreateComunidadDto {
  @IsString()
  nombre: string;

  @IsString()
  codigo: string;

  @IsNumber()
  porcentajeTasaSeguridad: number;
}
