import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    description: 'Nombre(s) del usuario',
    example: 'Juan Carlos',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({
    description: 'Apellido(s) del usuario',
    example: 'Pérez García',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario (formato internacional)',
    example: '+593987654321',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'URL de la imagen de avatar del usuario',
    example: 'https://example.com/avatars/user123.png',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}

