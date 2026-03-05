import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @ApiPropertyOptional({
    description: 'Nombre(s) del usuario (opcional)',
    example: 'Juan Carlos',
    maxLength: 100,
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellido(s) del usuario (opcional)',
    example: 'Pérez García',
    maxLength: 100,
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del usuario (opcional)',
    example: '+593987654321',
    maxLength: 20,
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen de avatar (opcional)',
    example: 'https://example.com/avatars/user123.png',
    maxLength: 500,
  })
  avatar?: string;
}

