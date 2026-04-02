import {IsString, IsNumber } from "class-validator";

export class CreateComunidadeDto {
    @IsString()
    nombre: string

    @IsString()
    codigo: string;

    @IsNumber()
    porcentajeTasaSeguridad: number;
}
