import { Decimal } from 'decimal.js';
import { PrismaMeterRepository } from './prisma-meter.repository';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import {
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoSaliente,
  TratamientoEntrante,
} from 'src/shared/enums';

describe('PrismaMeterRepository - replaceMeter', () => {
  let repository: PrismaMeterRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrisma)),
      $queryRaw: jest.fn().mockResolvedValue([{ contrato_id: BigInt(1) }]),
      contratos: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      medidores: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      historialMedidores: {
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      lecturas: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      reemplazoMedidor: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };

    repository = new PrismaMeterRepository(mockPrisma, {
      warn: jest.fn(),
    } as any);
  });

  it('should successfully execute replaceMeter with COBRO_REAL', async () => {
    const contratoMock = {
      contratoId: BigInt(1),
      categoriaTarifa: {
        categoriaTarifaId: 1,
        nombre: 'Residencial',
        consumoMinimoMensual: '10',
      },
      historialMedidores: [
        {
          historialId: BigInt(10),
          medidorId: BigInt(100),
          contratoId: BigInt(1),
          fechaDesde: new Date('2026-01-01'),
          lecturaInicial: '500',
        },
      ],
    };

    const nuevoMedidorMock = {
      medidorId: BigInt(200),
      deletedAt: null,
      historial: [],
    };

    mockPrisma.contratos.findUnique.mockResolvedValue(contratoMock);
    mockPrisma.medidores.findUnique.mockResolvedValue(nuevoMedidorMock);
    mockPrisma.lecturas.findFirst.mockResolvedValue({
      lecturaActual: '500',
    });
    mockPrisma.lecturas.create
      .mockResolvedValueOnce({ lecturaId: BigInt(1000) })
      .mockResolvedValueOnce({ lecturaId: BigInt(1001) });
    mockPrisma.historialMedidores.create.mockResolvedValue({
      historialId: BigInt(11),
    });
    mockPrisma.reemplazoMedidor.create.mockResolvedValue({
      reemplazoId: BigInt(1),
      contratoId: BigInt(1),
      historialSalienteId: BigInt(10),
      historialEntranteId: BigInt(11),
      motivo: MotivoReemplazoMedidor.DANO,
      responsabilidadDano: ResponsabilidadDano.NO_APLICA,
      tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      consumoMedidoSaliente: '30',
      consumoFacturableSaliente: '30',
      consumoMedidoEntrante: '0',
      consumoFacturableEntrante: '0',
      consumoDiferidoEntrante: '0',
      estado: 'APLICADA',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repository.replaceMeter({
      contratoId: BigInt(1),
      nuevoMedidorId: BigInt(200),
      lecturaFinalSaliente: new Decimal(530),
      lecturaInicialEntrante: new Decimal(0),
      motivo: MotivoReemplazoMedidor.DANO,
      tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      periodoOrigenId: 1,
      solicitadoPorUsuarioId: 1,
      claveIdempotencia: 'key-1',
      huellaSolicitud: 'fingerprint-1',
      requiereAprobacion: false,
    });

    expect(result.consumoMedidoSaliente).toEqual(new Decimal(30));
    expect(result.consumoFacturableSaliente).toEqual(new Decimal(30));
    expect(mockPrisma.historialMedidores.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { historialId: BigInt(10) },
        data: expect.objectContaining({
          fechaHasta: expect.any(Date),
        }),
      }),
    );
  });

  it('should calculate PROMEDIO_HISTORICO when selected as outgoing treatment', async () => {
    const contratoMock = {
      contratoId: BigInt(1),
      categoriaTarifa: {
        categoriaTarifaId: 1,
        nombre: 'Residencial',
        consumoMinimoMensual: '10',
      },
      historialMedidores: [
        {
          historialId: BigInt(10),
          medidorId: BigInt(100),
          contratoId: BigInt(1),
          fechaDesde: new Date('2026-01-01'),
          lecturaInicial: '500',
        },
      ],
    };

    const nuevoMedidorMock = {
      medidorId: BigInt(200),
      deletedAt: null,
      historial: [],
    };

    mockPrisma.contratos.findUnique.mockResolvedValue(contratoMock);
    mockPrisma.medidores.findUnique.mockResolvedValue(nuevoMedidorMock);
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ contrato_id: BigInt(1) }])
      .mockResolvedValueOnce([
        { consumo_calculado: '20' },
        { consumo_calculado: '25' },
        { consumo_calculado: '15' },
      ]);
    mockPrisma.lecturas.findFirst.mockResolvedValue({
      lecturaActual: '500',
    });
    mockPrisma.lecturas.findMany.mockResolvedValue([
      { consumoCalculado: '20' },
      { consumoCalculado: '25' },
      { consumoCalculado: '15' },
    ]);
    mockPrisma.lecturas.create
      .mockResolvedValueOnce({ lecturaId: BigInt(1000) })
      .mockResolvedValueOnce({ lecturaId: BigInt(1001) });
    mockPrisma.historialMedidores.create.mockResolvedValue({
      historialId: BigInt(11),
    });
    mockPrisma.reemplazoMedidor.create.mockResolvedValue({
      reemplazoId: BigInt(1),
      contratoId: BigInt(1),
      historialSalienteId: BigInt(10),
      historialEntranteId: BigInt(11),
      motivo: MotivoReemplazoMedidor.DANO,
      responsabilidadDano: ResponsabilidadDano.JUNTA,
      tratamientoSaliente: TratamientoSaliente.PROMEDIO_HISTORICO,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      consumoMedidoSaliente: '50',
      consumoFacturableSaliente: '20',
      consumoDiferidoEntrante: '0',
      promedioCalculado: '20',
      estado: 'APLICADA',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repository.replaceMeter({
      contratoId: BigInt(1),
      nuevoMedidorId: BigInt(200),
      lecturaFinalSaliente: new Decimal(550),
      lecturaInicialEntrante: new Decimal(0),
      motivo: MotivoReemplazoMedidor.DANO,
      responsabilidadDano: ResponsabilidadDano.JUNTA,
      tratamientoSaliente: TratamientoSaliente.PROMEDIO_HISTORICO,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      periodoOrigenId: 1,
      ventanaPromedio: 3,
      solicitadoPorUsuarioId: 1,
      claveIdempotencia: 'key-2',
      huellaSolicitud: 'fingerprint-2',
      requiereAprobacion: true,
    });

    expect(result.consumoMedidoSaliente).toEqual(new Decimal(50));
    expect(result.consumoFacturableSaliente).toEqual(new Decimal(20));
  });

  it('should throw EntityNotFoundException if contract does not exist', async () => {
    mockPrisma.contratos.findUnique.mockResolvedValue(null);

    await expect(
      repository.replaceMeter({
        contratoId: BigInt(999),
        nuevoMedidorId: BigInt(200),
        lecturaFinalSaliente: new Decimal(100),
        motivo: MotivoReemplazoMedidor.DANO,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: 1,
        solicitadoPorUsuarioId: 1,
        claveIdempotencia: 'key-3',
        huellaSolicitud: 'fingerprint-3',
        requiereAprobacion: false,
      }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException if outgoing reading is lower than previous base reading', async () => {
    const contratoMock = {
      contratoId: BigInt(1),
      historialMedidores: [
        {
          historialId: BigInt(10),
          medidorId: BigInt(100),
          contratoId: BigInt(1),
          fechaDesde: new Date('2026-01-01'),
          lecturaInicial: '500',
        },
      ],
    };

    const nuevoMedidorMock = {
      medidorId: BigInt(200),
      deletedAt: null,
      historial: [],
    };

    mockPrisma.contratos.findUnique.mockResolvedValue(contratoMock);
    mockPrisma.medidores.findUnique.mockResolvedValue(nuevoMedidorMock);
    mockPrisma.lecturas.findFirst.mockResolvedValue({
      lecturaActual: '500',
    });

    await expect(
      repository.replaceMeter({
        contratoId: BigInt(1),
        nuevoMedidorId: BigInt(200),
        lecturaFinalSaliente: new Decimal(480), // Menor que 500
        motivo: MotivoReemplazoMedidor.DANO,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        periodoOrigenId: 1,
        solicitadoPorUsuarioId: 1,
        claveIdempotencia: 'key-4',
        huellaSolicitud: 'fingerprint-4',
        requiereAprobacion: false,
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should persist complete tarifaOrigenSnapshot with rubros during replaceMeter', async () => {
    const contratoMock = {
      contratoId: BigInt(1),
      categoriaTarifa: {
        categoriaTarifaId: 1,
        nombre: 'Residencial',
        descripcion: 'Tarifa para domicilios',
        consumoMinimoMensual: 10,
        fechaVigenciaDesde: new Date('2026-01-01'),
        fechaVigenciaHasta: null,
        rubros: [
          {
            rubroId: 1,
            codigoSri: 'SRI-001',
            nombre: 'Consumo Agua',
            descripcion: 'M3 de agua',
            precioUnitario: new Decimal('1.50'),
            tipoRubro: 'VARIABLE',
            codigoSistemaRubro: null,
            esAutomatico: true,
            tarifaImpuestoId: 1,
          },
        ],
      },
      historialMedidores: [
        {
          historialId: BigInt(10),
          medidorId: BigInt(100),
          contratoId: BigInt(1),
          fechaDesde: new Date('2026-01-01'),
          lecturaInicial: '500',
        },
      ],
    };

    const nuevoMedidorMock = {
      medidorId: BigInt(200),
      deletedAt: null,
      historial: [],
    };

    mockPrisma.contratos.findUnique.mockResolvedValue(contratoMock);
    mockPrisma.medidores.findUnique.mockResolvedValue(nuevoMedidorMock);
    mockPrisma.lecturas.findFirst.mockResolvedValue({
      lecturaActual: '500',
    });
    mockPrisma.lecturas.create
      .mockResolvedValueOnce({ lecturaId: BigInt(1000) })
      .mockResolvedValueOnce({ lecturaId: BigInt(1001) });
    mockPrisma.historialMedidores.create.mockResolvedValue({
      historialId: BigInt(11),
    });
    mockPrisma.reemplazoMedidor.create.mockResolvedValue({
      reemplazoId: BigInt(1),
      contratoId: BigInt(1),
      historialSalienteId: BigInt(10),
      historialEntranteId: BigInt(11),
      motivo: MotivoReemplazoMedidor.DANO,
      responsabilidadDano: ResponsabilidadDano.NO_APLICA,
      tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      consumoMedidoSaliente: '30',
      consumoFacturableSaliente: '30',
      consumoMedidoEntrante: '0',
      consumoFacturableEntrante: '0',
      consumoDiferidoEntrante: '0',
      estado: 'APLICADA',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await repository.replaceMeter({
      contratoId: BigInt(1),
      nuevoMedidorId: BigInt(200),
      lecturaFinalSaliente: new Decimal(530),
      lecturaInicialEntrante: new Decimal(0),
      motivo: MotivoReemplazoMedidor.DANO,
      tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      periodoOrigenId: 1,
      solicitadoPorUsuarioId: 1,
      claveIdempotencia: 'key-snapshot-1',
      huellaSolicitud: 'fingerprint-snapshot-1',
      requiereAprobacion: false,
    });

    expect(mockPrisma.reemplazoMedidor.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tarifaOrigenSnapshot: expect.objectContaining({
            categoriaTarifaId: 1,
            nombre: 'Residencial',
            consumoMinimoMensual: 10,
            rubros: expect.arrayContaining([
              expect.objectContaining({
                rubroId: 1,
                precioUnitario: '1.5',
              }),
            ]),
          }),
        }),
      }),
    );
  });
});

describe('PrismaMeterRepository - create', () => {
  let repository: PrismaMeterRepository;
  let mockPrisma: any;

  const sequenceConfig = {
    secuencia_medidor_id: 1,
    prefijo: 'MED',
    longitud: 6,
  };

  const createData = {
    marca: 'Itron',
    modelo: 'CX1000',
    serie: 'SN-0001',
    estado: 'BODEGA' as any,
  };

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn().mockImplementation(async (cb) => cb(mockPrisma)),
      $queryRaw: jest.fn().mockResolvedValue([sequenceConfig]),
      secuenciaMedidor: {
        update: jest.fn().mockResolvedValue({ ultimoValor: 7 }),
      },
      medidores: {
        create: jest.fn().mockImplementation(({ data }) => ({
          medidorId: BigInt(1),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        })),
      },
    };

    repository = new PrismaMeterRepository(mockPrisma, {
      warn: jest.fn(),
      error: jest.fn(),
    } as any);
  });

  it('should assign the next correlative code padded to the configured length', async () => {
    const result = await repository.create(createData);

    expect(result.codigo).toBe('MED-000007');
    expect(mockPrisma.medidores.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ codigo: 'MED-000007' }),
      }),
    );
  });

  it('should lock the counter row before taking the next value', async () => {
    await repository.create(createData);

    const [rawQuery] = mockPrisma.$queryRaw.mock.calls[0] as [string[]];
    expect(rawQuery.join('')).toContain('FOR UPDATE');
    expect(mockPrisma.secuenciaMedidor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { secuenciaMedidorId: 1 },
        data: { ultimoValor: { increment: 1 } },
      }),
    );
  });

  it('should take the code inside the same transaction as the insert', async () => {
    await repository.create(createData);

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should honour a different prefix and length from the configuration', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([
      { secuencia_medidor_id: 1, prefijo: 'JAS', longitud: 4 },
    ]);
    mockPrisma.secuenciaMedidor.update.mockResolvedValue({ ultimoValor: 42 });

    const result = await repository.create(createData);

    expect(result.codigo).toBe('JAS-0042');
  });

  it('should fail when the sequence configuration row is missing', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([]);

    await expect(repository.create(createData)).rejects.toBeInstanceOf(
      InvalidDomainOperationException,
    );
    expect(mockPrisma.medidores.create).not.toHaveBeenCalled();
  });
});
