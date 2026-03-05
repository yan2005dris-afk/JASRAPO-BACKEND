import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Correo electrónico del usuario (opcional)',
    example: 'nuevo@jasrapo.com',
    format: 'email',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña del usuario (opcional)',
    example: 'NuevaPassword123!',
    minLength: 6,
  })
  password?: string;
}

