import type { SessionEntity } from '../../domain/entities/session.entity';

export class SessionMapper {
  static toEntity(raw: any): SessionEntity | null {
    if (!raw) return null;
    return {
      sesionId: raw.sesionId,
      usuarioId: raw.usuarioId,
      hashRefreshToken: raw.hashRefreshToken,
      direccionIp: raw.direccionIp,
      usuarioAgente: raw.usuarioAgente,
      revocado: raw.revocado,
      expiraEn: raw.expiraEn,
      createdAt: raw.createdAt,
    };
  }
}
