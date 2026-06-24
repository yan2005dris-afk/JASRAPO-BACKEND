import { Transform } from 'class-transformer';
import { IsEmail, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'admin@jasrapo.com',
    format: 'email',
    required: true,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  ) // Elimina espacios al inicio/final y convierte a minúsculas si llega string
  @IsNotEmptyString()
  @MaxLength(255)
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres, sin espacios)',
    example: 'Password123!',
    minLength: 6,
    required: true,
    format: 'password',
  })
  @IsNotEmptyString()
  @MaxLength(128)
  @MinLength(6)
  @Matches(/^\S+$/, { message: 'La contraseña no puede contener espacios' }) // Asegura que la contraseña no contenga espacios
  password: string;
}
