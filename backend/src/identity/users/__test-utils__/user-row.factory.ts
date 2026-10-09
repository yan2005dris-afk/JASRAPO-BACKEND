import type { UserRow } from '../infrastructure/repositories/user.include';

export function userRow(overrides?: Partial<UserRow>): UserRow {
  return {
    usuarioId: 1,
    email: 'test@example.com',
    nombres: 'Juan',
    apellidos: 'Perez',
    telefono: '+593991234567',
    avatar: null,
    deletedAt: null,
    rol: {
      rolId: 1,
      nombre: 'admin',
      deletedAt: null,
    },
    ...overrides,
  };
}
