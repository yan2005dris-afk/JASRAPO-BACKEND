import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@jasrapo.com',
    format: 'email',
    required: true,
  })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'MiPassword123!',
    minLength: 6,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/^\S+$/, { message: 'La contraseña no puede contener espacios' })
  password: string;
}
