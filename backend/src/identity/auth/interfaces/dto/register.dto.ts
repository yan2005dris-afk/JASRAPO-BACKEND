import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class RegisterDto {
  @ApiProperty({
    description: 'Correo electrónico del nuevo usuario',
    example: 'nuevo@jasrapo.com',
    format: 'email',
    required: true,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmptyString()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Nombres del usuario',
    example: 'Juan',
    required: true,
  })
  @IsNotEmptyString()
  @MaxLength(100)
  nombres: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez',
    required: true,
  })
  @IsNotEmptyString()
  @MaxLength(100)
  apellidos: string;

  @ApiProperty({
    description:
      'Teléfono del usuario (formato Ecuador: +593XXXXXXXXX o 09XXXXXXXX)',
    example: '+593991234567',
    required: true,
  })
  @IsNotEmptyString()
  @MaxLength(20)
  telefono: string;

  @ApiProperty({
    description: 'ID del rol (opcional)',
    example: 1,
    required: false,
  })
  @IsString()
  rolId?: string;
}
