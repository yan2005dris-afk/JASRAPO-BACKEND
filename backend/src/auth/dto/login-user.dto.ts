import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @Transform(({ value }) => value.trim().toLowerCase()) //Elimina espacios en blanco al inicio y final, además convierte a minúsculas antes de la validación
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^\S+$/, { message: 'Password cannot contain spaces' }) // Asegura que la contraseña no contenga espacios
  password: string;
}
