import { ApiProperty } from '@nestjs/swagger';

export class SessionEntity {
  @ApiProperty({ example: 'test-uuid-123', description: 'ID de la sesión' })
  sesionId: string;

  @ApiProperty({ example: 1, description: 'ID del usuario asociado' })
  usuarioId: number;

  @ApiProperty({ example: 'hash-token', description: 'Hash del refresh token' })
  hashRefreshToken: string;

  @ApiProperty({
    example: '127.0.0.1',
    description: 'Dirección IP de la sesión',
    nullable: true,
  })
  direccionIp: string | null;

  @ApiProperty({
    example: 'Mozilla/5.0',
    description: 'Usuario agente del navegador/dispositivo',
    nullable: true,
  })
  usuarioAgente: string | null;

  @ApiProperty({ example: false, description: 'Estado de revocación' })
  revocado: boolean;

  @ApiProperty({
    example: '2026-06-18T00:00:00.000Z',
    description: 'Fecha de expiración de la sesión',
  })
  expiraEn: Date;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de creación de la sesión',
  })
  createdAt: Date;
}
