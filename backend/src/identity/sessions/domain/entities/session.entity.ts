import { ApiProperty } from '@nestjs/swagger';

export class SessionEntity {
  @ApiProperty({ example: 'test-uuid-123', description: 'ID de la sesión' })
  sesionId: string;

  @ApiProperty({ example: 1, description: 'ID del usuario asociado' })
  usuarioId: number;

  @ApiProperty({ example: 'a'.repeat(64), description: 'Secreto de sesión' })
  sessionSecret: string;

  @ApiProperty({ example: 1, description: 'Versión del token de sesión' })
  tokenVersion: number;

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

  constructor(partial?: Partial<SessionEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.usuarioId !== undefined && this.usuarioId <= 0) {
      throw new Error('El ID de usuario debe ser mayor a cero');
    }
    if (this.tokenVersion !== undefined && this.tokenVersion < 1) {
      throw new Error('La versión del token debe ser mayor o igual a 1');
    }
  }

  revoke(): void {
    this.revocado = true;
  }

  isExpired(): boolean {
    return this.expiraEn ? new Date() > new Date(this.expiraEn) : false;
  }
}
