import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ example: 'Usuario registrado exitosamente', description: 'Mensaje de respuesta' })
  message: string;

  @ApiProperty({ example: 1, description: 'ID del usuario creado' })
  usuarioId: number;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de acceso JWT',
  })
  accessToken: string;

  @ApiProperty({ example: 'session-id-123', description: 'ID de la sesión' })
  sid: string;

  @ApiProperty({ example: 1, description: 'ID del usuario' })
  sub: number;

  @ApiProperty({ example: 'admin@jasrapo.com', description: 'Correo electrónico' })
  email: string;

  @ApiPropertyOptional({ example: 'Admin', description: 'Nombre completo' })
  nombre?: string | null;

  @ApiPropertyOptional({ example: 1, description: 'ID del rol' })
  rolId?: number | null;

  @ApiPropertyOptional({ example: 'Administrador', description: 'Nombre del rol' })
  nombreRol?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'URL del avatar' })
  avatar?: string | null;

  @ApiProperty({ example: '2026-08-15T00:00:00.000Z', description: 'Fecha de emisión' })
  createdAt: Date | string;

  @ApiProperty({ example: '2026-08-15T01:00:00.000Z', description: 'Fecha de expiración' })
  expiresAt: Date | string;
}

export class RefreshResponseDto {
  @ApiProperty({ example: 'Token refrescado correctamente', description: 'Mensaje de éxito' })
  message: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Nuevo token de acceso JWT',
  })
  accessToken: string;

  @ApiProperty({ example: '2026-08-15T00:00:00.000Z', description: 'Fecha de emisión' })
  createdAt: Date | string;

  @ApiProperty({ example: '2026-08-15T01:00:00.000Z', description: 'Fecha de expiración' })
  expiresAt: Date | string;
}
