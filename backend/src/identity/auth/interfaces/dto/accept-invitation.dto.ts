import { IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Token de invitación recibido por email',
    example: 'abc123def456...',
    required: true,
  })
  @IsNotEmptyString()
  @MaxLength(512)
  token: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres, mayúsculas, números, caracteres especiales)',
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
  password: string;
}
