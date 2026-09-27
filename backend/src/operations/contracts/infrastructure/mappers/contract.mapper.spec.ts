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

  const baseRecord = {
    contratoId: 1n,
    clienteId: 10n,
    sectorId: null,
    categoriaTarifaId: 3,
    numeroGuia: 'GUIA-001',
    fechaInicio: new Date('2024-01-15'),
    direccionSuministro: 'Av. Principal 123',
    estadoCobranza: 'NO_APLICA',
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
  };

  it('mapea la asignación de instalación activa cuando el contrato está PENDIENTE_INSTALACION', () => {
    const result = ContractMapper.toDomain({
      ...baseRecord,
      estadoServicio: 'PENDIENTE_INSTALACION',
      ordenesTrabajo: [
        {
          ordenTrabajoId: 77n,
          estado: 'PENDIENTE',
          ruta: {
            rutaId: 20n,
            nombre: 'Instalaciones GUIA-001',
            estado: 'PENDIENTE',
            fechaPlanificada: new Date('2026-08-20'),
            operario: { nombres: 'Juan', apellidos: 'Pérez' },
          },
        },
      ],
    } as never);

    expect(result?.asignacionInstalacion).toEqual({
      rutaId: 20n,
      nombreRuta: 'Instalaciones GUIA-001',
      estadoRuta: 'PENDIENTE',
      ordenTrabajoId: 77n,
      estadoOrdenTrabajo: 'PENDIENTE',
      fechaPlanificada: new Date('2026-08-20'),
      operarioNombre: 'Juan Pérez',
    });
  });

  it('no expone asignación de instalación si el contrato no está PENDIENTE_INSTALACION', () => {
    const result = ContractMapper.toDomain({
      ...baseRecord,
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'AL_DIA',
      ordenesTrabajo: [],
    } as never);

    expect(result?.asignacionInstalacion).toBeNull();
  });
});
