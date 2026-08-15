import { SessionEntity } from '../../domain/entities/session.entity';

export class SessionMapper {
  static toEntity(raw: any): SessionEntity | null {
    if (!raw) return null;
    return new SessionEntity({
      sesionId: raw.sesionId,
      usuarioId: raw.usuarioId,
      sessionSecret: raw.sessionSecret,
      tokenVersion: raw.tokenVersion,
      direccionIp: raw.direccionIp,
      usuarioAgente: raw.usuarioAgente,
      revocado: raw.revocado,
      expiraEn: raw.expiraEn,
      createdAt: raw.createdAt,
    });
  }
}
