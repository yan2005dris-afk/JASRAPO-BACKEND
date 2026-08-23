import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UnlockAccountDto {
  @ApiProperty({
    description: 'Correo electrónico de la cuenta a desbloquear',
    example: 'operario@jasrapo.gob.ec',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @ApiPropertyOptional({
    description: 'Motivo administrativo del desbloqueo',
    example: 'Solicitud del usuario tras restablecer credenciales',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivo?: string;
}

export class UnlockAccountResponseDto {
  @ApiProperty({ example: 42 })
  usuarioId: number;

  @ApiProperty({ example: 'operario@jasrapo.gob.ec' })
  email: string;

  @ApiProperty({ example: 1 })
  unlockedBy: number;

  @ApiProperty({ example: '2026-08-18T21:40:00.000Z' })
  unlockedAt: string;

  @ApiProperty({ example: 'Cuenta desbloqueada exitosamente' })
  mensaje: string;
}
