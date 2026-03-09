import { Type } from "class-transformer";
import { IsInt, IsNumberString, IsString, Length } from "class-validator";

export class CreateClientDto {
    @IsString()
    nombre: string;

    //BigInt se recibe como string en HTTP
    @IsInt()
    @Type(() => Number)
    comunidadId: number;

    //Cedula es un string unico
    @IsNumberString()
    @Length(10, 10) // Asumiendo que la cédula tiene exactamente 10 dígitos
    cedula: string;
}
