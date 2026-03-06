import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'admin@jasrapo.com',
    format: 'email',
    required: true,
  })
  @Transform(({ value }) => value.trim().toLowerCase()) //Elimina espacios en blanco al inicio y final, además convierte a minúsculas antes de la validación
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres, sin espacios)',
    example: 'Password123!',
    minLength: 6,
    required: true,
    format: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^\S+$/, { message: 'La contraseña no puede contener espacios' }) // Asegura que la contraseña no contenga espacios
  password: string;
}
