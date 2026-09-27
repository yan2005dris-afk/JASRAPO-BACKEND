import { ContractMapper } from './contract.mapper';

describe('ContractMapper', () => {
  it('maps separated contract states and agreement presence independently', () => {
    const result = ContractMapper.toDomain({
      contratoId: 1n,
      clienteId: 10n,
      sectorId: null,
      categoriaTarifaId: 3,
      numeroGuia: 'GUIA-001',
      fechaInicio: new Date('2024-01-15'),
      direccionSuministro: 'Av. Principal 123',
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'AL_DIA',
      creadoPor: 'admin',
      comunidadId: 2,
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-06-01'),
      categoriaTarifa: null,
      cliente: null,
      comunidad: null,
      sector: null,
      convenios: [{ convenioId: 12 }],
      historialMedidores: [],
    } as never);

    expect(result).toMatchObject({
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'AL_DIA',
      tieneConvenioActivo: true,
    });
    expect(result).not.toHaveProperty('estado');
  });

  it('returns null for an absent record', () => {
    expect(ContractMapper.toDomain(null)).toBeNull();
  });

  it('maps Decimal coordinates to numbers', () => {
    const result = ContractMapper.toDomain({
      contratoId: 1n,
      clienteId: 10n,
      sectorId: null,
      categoriaTarifaId: 3,
      numeroGuia: 'GUIA-001',
      fechaInicio: new Date('2024-01-15'),
      direccionSuministro: 'Av. Principal 123',
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'AL_DIA',
      creadoPor: 'admin',
      comunidadId: 2,
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-06-01'),
      categoriaTarifa: null,
      cliente: null,
      comunidad: null,
      sector: null,
      convenios: [],
      historialMedidores: [],
      latitud: { toString: () => '-1.8021' } as never,
      longitud: { toString: () => '-80.7554' } as never,
    } as never);

    expect(result?.latitud).toBe(-1.8021);
    expect(result?.longitud).toBe(-80.7554);
  });

  it('maps null coordinates to null', () => {
    const result = ContractMapper.toDomain({
      contratoId: 1n,
      clienteId: 10n,
      sectorId: null,
      categoriaTarifaId: 3,
      numeroGuia: 'GUIA-001',
      fechaInicio: new Date('2024-01-15'),
      direccionSuministro: 'Av. Principal 123',
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'AL_DIA',
      creadoPor: 'admin',
      comunidadId: 2,
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-06-01'),
      categoriaTarifa: null,
      cliente: null,
      comunidad: null,
      sector: null,
      convenios: [],
      historialMedidores: [],
      latitud: null,
      longitud: null,
    } as never);

    expect(result?.latitud).toBeNull();
    expect(result?.longitud).toBeNull();
  });
});
