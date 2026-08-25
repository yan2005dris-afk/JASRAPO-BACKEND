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

  it('should maintain active history when installMeter is called for the already linked meter', async () => {
    const medidorId = BigInt(100);
    const contratoId = BigInt(1);
    const now = new Date();

    mockPrisma.medidores.update.mockResolvedValue({
      medidorId,
      estado: 'INSTALADO',
      fechaInstalacion: now,
    });
    mockPrisma.historialMedidores.findFirst.mockResolvedValue({
      historialId: BigInt(5),
      medidorId,
      contratoId,
      fechaHasta: null,
    });
    mockPrisma.historialMedidores.update.mockResolvedValue({});
    mockPrisma.contratos.update.mockResolvedValue({});

    await repository.installMeter({
      medidorId,
      contratoId,
      estado: 'INSTALADO' as any,
      estadoContrato: 'ACTIVO' as any,
      fechaInstalacion: now,
    });

    expect(mockPrisma.historialMedidores.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { historialId: BigInt(5) },
        data: { fechaDesde: now },
      }),
    );
    // Debe NO haber seteado fechaHasta en el historial abierto
    expect(mockPrisma.historialMedidores.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ fechaHasta: expect.anything() }),
      }),
    );
  });
});
