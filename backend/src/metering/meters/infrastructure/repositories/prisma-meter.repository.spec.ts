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
      },
    };

    repository = new PrismaMeterRepository(mockPrisma);
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
      }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });
});
