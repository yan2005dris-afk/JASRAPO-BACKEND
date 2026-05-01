import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario (debe ser único)',
    example: 'usuario@jasrapo.com',
    format: 'email',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'Password123!',
    minLength: 6,
    required: true,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
