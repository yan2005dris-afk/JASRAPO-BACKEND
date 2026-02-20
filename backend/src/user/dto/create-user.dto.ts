import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  userEmail: string;

  @IsString()
  userName: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'La contraseña debe tener al menos una mayúscula, un número y un carácter especial (!@#$%^&*)',
  })
  userPassword: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  perfilId:number;
}
