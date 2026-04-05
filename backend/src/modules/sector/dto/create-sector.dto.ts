import { IsNumber } from "class-validator";
import { IsString } from "class-validator/types/decorator/typechecker/IsString";

export class CreateSectorDto {
    @IsNumber()
    comunidadId: number;

    @IsString()
    codigo: string;

    @IsString()
    nombre: string
}