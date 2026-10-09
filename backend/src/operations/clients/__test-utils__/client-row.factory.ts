import type { ClientRow } from '../infrastructure/repositories/client.include';

export function clientRow(overrides: Partial<ClientRow> = {}): ClientRow {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    clienteId: 1n,
    identificacion: '0102030405',
    nombres: 'Juan',
    apellidos: 'Pérez',
    razonSocial: null,
    email: 'juan@example.com',
    telefono: '0999999999',
    telefonoSecundario: null,
    direccionDomicilio: 'Calle Principal 123',
    activo: true,
    aplicaDiscapacidad: false,
    aplicaTerceraEdad: false,
    tipoIdentificacionId: 1,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    tipoIdentificacion: {
      id: 1,
      codigo: 'CEDULA',
      descripcion: 'Cédula de Identidad',
      activo: true,
      createdAt: now,
      updatedAt: now,
    },
    ...overrides,
  } as unknown as ClientRow;
}
