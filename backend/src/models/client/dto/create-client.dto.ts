import { IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateClientDto {
    @IsString()
    nombre: string;

    //BigInt se recibe como string en HTTP
    @IsOptional()
    @IsNumberString()
    comunidadId?: string;
}
