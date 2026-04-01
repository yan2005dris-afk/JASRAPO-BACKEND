import {IsString} from "class-validator";

export class CreateComunidadeDto {
    @IsString()
    nombre: string
}
