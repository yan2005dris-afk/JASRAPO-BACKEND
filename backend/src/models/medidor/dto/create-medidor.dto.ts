import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CrearMedidorDto {
  @IsNotEmpty()
  @IsNumber()
  lecturaInicial: number;

  @IsNotEmpty()
  @IsString()
  marca: string;

  @IsNotEmpty()
  @IsString()
  modelo: string;

  @IsNotEmpty()
  @IsString()
  serie: string;
}