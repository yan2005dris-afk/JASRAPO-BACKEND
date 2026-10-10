import {
  IsStrongPassword,
  MaxLength,
  IsBoolean,
  Equals,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Token de invitación recibido por email',
    example: 'abc123def456...',
    required: true,
  })
  @IsNotEmptyString()
  @MaxLength(512)
  token!: string;

  @ApiProperty({
    description:
      'Contraseña del usuario (mínimo 8 caracteres, mayúsculas, números, caracteres especiales)',
    example: 'SecurePass123!',
    required: true,
  })
  @IsNotEmptyString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password!: string;

  @ApiProperty({
    description: 'Confirmación de contraseña (debe coincidir con password)',
    example: 'SecurePass123!',
    required: true,
  })
  @IsNotEmptyString()
  password_confirmation!: string;

  @ApiProperty({
    description: 'Aceptación de términos y condiciones',
    example: true,
    required: true,
  })
  @IsBoolean()
  @Equals(true, { message: 'Debés aceptar los términos y condiciones' })
  accept_terms!: boolean;

  @ApiProperty({
    description: 'Versión de términos aceptados',
    example: 'v0',
    required: false,
  })
  @ValidateIf((o) => o.terms_version !== undefined)
  @MaxLength(50)
  terms_version?: string;
}
