import {IsString} from "class-validator";

export class CreateSectorDto {
    @IsString()
    nombre: string
}