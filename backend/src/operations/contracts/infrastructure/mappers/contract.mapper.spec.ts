import { ContractMapper } from './contract.mapper';
import { ContractEntity } from '../../domain/entities/contract.entity';

describe('ContractMapper', () => {
  describe('toDomain', () => {
    it('should return null for null or undefined input', () => {
      expect(ContractMapper.toDomain(null)).toBeNull();
      expect(ContractMapper.toDomain(undefined)).toBeNull();
    });

    it('should convert a full Prisma raw object to ContractEntity with all relations', () => {
      const raw = {
        contratoId: BigInt(1),
        clienteId: BigInt(10),
        sectorId: 5,
        categoriaTarifaId: 3,
        numeroGuia: 'GUIA-001',
        fechaInicio: new Date('2024-01-15'),
        direccionSuministro: 'Av. Principal 123',
        estado: 'ACTIVO',
        creadoPor: 'admin',
        comunidadId: 2,
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-01'),
        categoriaTarifa: {
          categoriaTarifaId: 3,
          nombre: 'Residencial',
          descripcion: 'Tarifa para hogares',
          valorBase: 150.5,
        },
        cliente: {
          clienteId: BigInt(10),
          identificacion: '1234567890',
          nombres: 'Juan',
          apellidos: 'Pérez',
          razonSocial: null,
        },
        comunidad: {
          comunidadId: 2,
          codigo: 'COM-001',
          nombre: 'Residencial Las Palmas',
        },
        sector: {
          sectorId: 5,
          codigo: 'SEC-A',
          nombre: 'Sector A',
        },
        historialMedidores: [
          {
            historialId: BigInt(100),
            medidorId: BigInt(200),
            fechaDesde: new Date('2024-01-15'),
            fechaHasta: null,
            lecturaInicial: '10',
            lecturaFinal: null,
            medidor: {
              medidorId: BigInt(200),
              serie: 'SER-12345',
              marca: 'MarcaX',
              modelo: 'ModeloZ',
              lecturas: [
                {
                  lecturaId: 301n,
                  fecha: new Date('2024-06-15T12:00:00Z'),
                  lecturaActual: '125',
                  lecturaAnterior: '100',
                },
              ],
            },
          },
        ],
      };

      const result = ContractMapper.toDomain(raw);

      expect(result).toBeInstanceOf(ContractEntity);
      expect(result!.contratoId).toEqual(BigInt(1));
      expect(result!.clienteId).toEqual(BigInt(10));
      expect(result!.sectorId).toBe(5);
      expect(result!.categoriaTarifaId).toBe(3);
      expect(result!.numeroGuia).toBe('GUIA-001');
      expect(result!.estado).toBe('ACTIVO');
      expect(result!.comunidadId).toBe(2);
      expect(result!.deletedAt).toBeNull();

      // CategoriaTarifa relation
      expect(result!.categoriaTarifa).toBeDefined();
      expect(result!.categoriaTarifa!.nombre).toBe('Residencial');

      // Cliente relation
      expect(result!.cliente).toBeDefined();
      expect(result!.cliente!.identificacion).toBe('1234567890');
      expect(result!.cliente!.nombres).toBe('Juan');

      // Comunidad relation
      expect(result!.comunidad).toBeDefined();
      expect(result!.comunidad!.codigo).toBe('COM-001');

      // Sector relation
      expect(result!.sector).toBeDefined();
      expect(result!.sector!.codigo).toBe('SEC-A');

      // HistorialMedidores relation
      expect(result!.historialMedidores).toHaveLength(1);
      expect(result!.historialMedidores![0].medidor.serie).toBe('SER-12345');
      expect(
        result!.historialMedidores![0].ultimaLecturaAprobada,
      ).toMatchObject({ lecturaId: 301n, lecturaActual: 125 });
      expect(result!.historialMedidores![0].lecturaInicial).toBe(10);
    });

    it('should handle null optional relations', () => {
      const raw = {
        contratoId: BigInt(2),
        clienteId: BigInt(20),
        sectorId: null,
        categoriaTarifaId: 1,
        numeroGuia: 'GUIA-002',
        fechaInicio: new Date('2024-02-01'),
        direccionSuministro: 'Calle Secundaria 456',
        estado: 'ACTIVO',
        creadoPor: null,
        comunidadId: 1,
        deletedAt: null,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-06-01'),
        categoriaTarifa: null,
        cliente: null,
        comunidad: null,
        sector: null,
        historialMedidores: null,
      };

      const result = ContractMapper.toDomain(raw);

      expect(result).toBeInstanceOf(ContractEntity);
      expect(result!.categoriaTarifa).toBeNull();
      expect(result!.cliente).toBeNull();
      expect(result!.comunidad).toBeNull();
      expect(result!.sector).toBeNull();
      expect(result!.historialMedidores).toBeNull();
    });

    it('should handle empty historialMedidores array', () => {
      const raw = {
        contratoId: BigInt(3),
        clienteId: BigInt(30),
        sectorId: null,
        categoriaTarifaId: 2,
        numeroGuia: 'GUIA-003',
        fechaInicio: new Date('2024-03-01'),
        direccionSuministro: 'Av. Tercera 789',
        estado: 'INACTIVO',
        creadoPor: null,
        comunidadId: 3,
        deletedAt: new Date('2024-12-01'),
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-12-01'),
        categoriaTarifa: {
          categoriaTarifaId: 2,
          nombre: 'Comercial',
          descripcion: 'Tarifa comercial',
          valorBase: 250.0,
        },
        cliente: {
          clienteId: BigInt(30),
          identificacion: '0987654321',
          nombres: 'María',
          apellidos: 'García',
          razonSocial: 'Empresa SRL',
        },
        comunidad: {
          comunidadId: 3,
          codigo: 'COM-002',
          nombre: 'Zona Industrial',
        },
        sector: {
          sectorId: 10,
          codigo: 'SEC-B',
          nombre: 'Sector B',
        },
        historialMedidores: [],
      };

      const result = ContractMapper.toDomain(raw);

      expect(result!.historialMedidores).toEqual([]);
      expect(result!.deletedAt).toBeInstanceOf(Date);
      expect(result!.cliente!.razonSocial).toBe('Empresa SRL');
    });
  });

  it('should map persisted lifecycle fields while keeping the legacy state', () => {
    const raw = {
      contratoId: 4n,
      clienteId: 40n,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'GUIA-004',
      fechaInicio: new Date('2024-04-01'),
      direccionSuministro: 'Dir 4',
      estado: 'EN_CONVENIO',
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'EN_CONVENIO',
      creadoPor: null,
      comunidadId: 4,
      deletedAt: null,
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-06-01'),
    };

    const result = ContractMapper.toDomain(raw);

    expect(result).toMatchObject({
      estado: 'EN_CONVENIO',
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'EN_CONVENIO',
    });
  });

  it('should derive bridge fields from legacy state when raw callers omit them', () => {
    const raw = {
      contratoId: 5n,
      clienteId: 50n,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'GUIA-005',
      fechaInicio: new Date('2024-05-01'),
      direccionSuministro: 'Dir 5',
      estado: 'ACTIVO',
      creadoPor: null,
      comunidadId: 5,
      deletedAt: null,
      createdAt: new Date('2024-05-01'),
      updatedAt: new Date('2024-06-01'),
    };

    const result = ContractMapper.toDomain(raw);

    expect(result!.estadoServicio).toBe('ACTIVO');
    expect(result!.estadoCobranza).toBe('AL_DIA');
  });

  it('should preserve legacy semantics for a post-migration row with bridge fields', () => {
    const raw = {
      contratoId: 6n,
      clienteId: 60n,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'GUIA-006',
      fechaInicio: new Date('2024-06-01'),
      direccionSuministro: 'Dir 6',
      estado: 'EN_MORA',
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'EN_MORA',
      creadoPor: null,
      comunidadId: 6,
      deletedAt: null,
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-06-01'),
    };

    const result = ContractMapper.toDomain(raw);

    expect(result).toMatchObject({
      estado: 'EN_MORA',
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'EN_MORA',
    });
  });

  describe('toDomainList', () => {
    it('should convert an array of Prisma raw objects', () => {
      const rawList = [
        {
          contratoId: BigInt(1),
          clienteId: BigInt(10),
          sectorId: null,
          categoriaTarifaId: 1,
          numeroGuia: 'GUIA-001',
          fechaInicio: new Date(),
          direccionSuministro: 'Dir 1',
          estado: 'ACTIVO',
          creadoPor: null,
          comunidadId: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          contratoId: BigInt(2),
          clienteId: BigInt(20),
          sectorId: null,
          categoriaTarifaId: 2,
          numeroGuia: 'GUIA-002',
          fechaInicio: new Date(),
          direccionSuministro: 'Dir 2',
          estado: 'INACTIVO',
          creadoPor: null,
          comunidadId: 2,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const results = ContractMapper.toDomainList(rawList);

      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(ContractEntity);
      expect(results[0].numeroGuia).toBe('GUIA-001');
      expect(results[1].numeroGuia).toBe('GUIA-002');
    });

    it('should filter out null items from the list', () => {
      const rawList = [
        {
          contratoId: BigInt(1),
          clienteId: BigInt(10),
          sectorId: null,
          categoriaTarifaId: 1,
          numeroGuia: 'GUIA-001',
          fechaInicio: new Date(),
          direccionSuministro: 'Dir 1',
          estado: 'ACTIVO',
          creadoPor: null,
          comunidadId: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        null,
        {
          contratoId: BigInt(3),
          clienteId: BigInt(30),
          sectorId: null,
          categoriaTarifaId: 3,
          numeroGuia: 'GUIA-003',
          fechaInicio: new Date(),
          direccionSuministro: 'Dir 3',
          estado: 'ACTIVO',
          creadoPor: null,
          comunidadId: 3,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const results = ContractMapper.toDomainList(rawList);

      expect(results).toHaveLength(2);
      expect(results[0].numeroGuia).toBe('GUIA-001');
      expect(results[1].numeroGuia).toBe('GUIA-003');
    });
  });
});
