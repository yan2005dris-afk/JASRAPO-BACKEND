import type { SessionRow } from '../infrastructure/repositories/session.include';

/**
 * Factory para construir filas `SessionRow` tipadas en specs.
 *
 * Reemplaza al `new SessionEntity(...)` (que era `Object.assign(this, partial)`)
 * en specs del BC sessions. Cada override se pisa sobre defaults sensatos.
 * Si Prisma cambia la forma del modelo `Sesiones`, el factory lo detecta
 * en compile-time.
 *
 * @example
 *   const row = sessionRow({ sesionId: 'abc-123', revocado: true });
 *   prisma.sesiones.findUnique.mockResolvedValue(row);
 */
export function sessionRow(overrides: Partial<SessionRow> = {}): SessionRow {
  const base: SessionRow = {
    sesionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    usuarioId: 1,
    sessionSecret: 'secret-token-123',
    tokenVersion: 1,
    direccionIp: '127.0.0.1',
    usuarioAgente: 'Mozilla/5.0 (test)',
    revocado: false,
    expiraEn: new Date('2026-12-31T23:59:59.000Z'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  return { ...base, ...overrides };
}
