import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Correo electrónico del nuevo usuario',
    example: 'nuevo@jasrapo.com',
    format: 'email',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña segura (mínimo 6 caracteres, debe contener al menos una mayúscula, un número y un carácter especial)',
    example: 'SecurePass123!',
    minLength: 6,
    required: true,
    format: 'password',
  })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'La contraseña debe tener al menos una mayúscula, un número y un carácter especial (!@#$%^&*)',
  })
  password: string;
}

