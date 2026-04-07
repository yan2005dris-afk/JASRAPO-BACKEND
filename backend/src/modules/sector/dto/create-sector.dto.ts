import { IsNumber, IsString } from "class-validator";

export class CreateSectorDto {
    
    @IsNumber()
    comunidadId!: number;

    @IsString()
    codigo!: string;

    @IsString()
    nombre!: string;
}