export class SessionEntity {
  sesionId: string;
  usuarioId: number;
  sessionSecret: string;
  tokenVersion: number;
  direccionIp: string | null;
  usuarioAgente: string | null;
  revocado: boolean;
  expiraEn: Date;
  createdAt: Date;

  constructor(partial?: Partial<SessionEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
