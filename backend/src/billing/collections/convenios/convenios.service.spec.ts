import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateConvenioUseCase } from './use-cases/create-convenio.use-case';
import { FindOneConvenioUseCase } from './use-cases/find-one-convenio.use-case';
import { GetDebtSummaryUseCase } from './use-cases/get-debt-summary.use-case';
import { ConveniosService } from './convenios.service';

describe('ConveniosService', () => {
  let service: ConveniosService;

  const mockPrismaService = {
    estadoConvenio: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    estadoCuotaConvenio: {
      findMany: jest.fn(),
    },
    convenios: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    cuotaConvenio: {
      findMany: jest.fn(),
    },
  };

  const mockCreateUseCase = { execute: jest.fn() };
  const mockFindOneUseCase = { execute: jest.fn() };
  const mockGetDebtSummaryUseCase = { execute: jest.fn() };

  const convenioRecord = {
    convenioId: 1n,
    contratoId: 10n,
    numeroCuotas: 2,
    abonoInicial: 5,
    deudaTotal: 100,
    mesesMoraActual: 1,
    estado: { estadoConvenioId: 1n, codigo: 'PREPARADO', nombre: 'Preparado' },
    fechaAprobacion: null,
    fechaPrimerPago: new Date('2026-06-01T00:00:00.000Z'),
    fechaProximoPago: new Date('2026-06-01T00:00:00.000Z'),
    montoPagadoActual: 0,
    motivo: null,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
    cuotaConvenio: [],
  };

  const cuotaRecord = {
    cuotaConvenioId: 1n,
    convenioId: 1n,
    numeroCuota: 1,
    valorCuota: 50,
    fechaVencimiento: new Date('2026-06-01T00:00:00.000Z'),
    estado: {
      estadoCuotaConvenioId: 1n,
      codigo: 'PENDIENTE',
      nombre: 'Pendiente',
    },
    fechaPago: null,
    montoPagado: 0,
    saldoPendiente: 50,
    diasRetraso: 0,
    interesMoraAplicado: 0,
    pagoCompleto: false,
    fechaPagoAnticipado: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConveniosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CreateConvenioUseCase, useValue: mockCreateUseCase },
        { provide: FindOneConvenioUseCase, useValue: mockFindOneUseCase },
        { provide: GetDebtSummaryUseCase, useValue: mockGetDebtSummaryUseCase },
      ],
    }).compile();

    service = module.get<ConveniosService>(ConveniosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return active convenio statuses mapped to DTOs', async () => {
    mockPrismaService.estadoConvenio.findMany.mockResolvedValue([
      {
        estadoConvenioId: 1n,
        codigo: 'ACTIVO',
        nombre: 'Activo',
        descripcion: 'En curso',
        orden: 1,
      },
    ]);

    const result = await service.findAllEstadosConvenio();

    expect(result).toEqual([
      {
        estadoConvenioId: 1,
        codigo: 'ACTIVO',
        nombre: 'Activo',
        descripcion: 'En curso',
        orden: 1,
      },
    ]);
    expect(mockPrismaService.estadoConvenio.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { activo: true },
        orderBy: { orden: 'asc' },
      }),
    );
  });

  it('should return active installment statuses mapped to DTOs', async () => {
    mockPrismaService.estadoCuotaConvenio.findMany.mockResolvedValue([
      {
        estadoCuotaConvenioId: 2n,
        codigo: 'PAGADA',
        nombre: 'Pagada',
        descripcion: null,
        orden: 2,
      },
    ]);

    const result = await service.findAllEstadosCuotaConvenio();

    expect(result).toEqual([
      {
        estadoCuotaConvenioId: 2,
        codigo: 'PAGADA',
        nombre: 'Pagada',
        descripcion: null,
        orden: 2,
      },
    ]);
  });

  it('should delegate debt summary converting contratoId to BigInt', async () => {
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({ contratoId: '10' });

    const result = await service.getDebtSummary('10');

    expect(result).toEqual({ contratoId: '10' });
    expect(mockGetDebtSummaryUseCase.execute).toHaveBeenCalledWith(10n);
  });

  it('should create convenio through use case and map response', async () => {
    mockCreateUseCase.execute.mockResolvedValue(convenioRecord);

    const result = await service.create({
      contratoId: '10',
      numeroCuotas: 2,
      fechaPrimerPago: '2026-06-01',
    });

    expect(result).toMatchObject({
      convenioId: '1',
      contratoId: '10',
      numeroCuotas: 2,
      cuotas: [],
    });
  });

  it('should find all convenios without contrato filter', async () => {
    mockPrismaService.convenios.findMany.mockResolvedValue([convenioRecord]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(mockPrismaService.convenios.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('should find all convenios by contrato filter', async () => {
    mockPrismaService.convenios.findMany.mockResolvedValue([convenioRecord]);

    await service.findAll('10');

    expect(mockPrismaService.convenios.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, contratoId: 10n },
      }),
    );
  });

  it('should find one convenio through use case and map response', async () => {
    mockFindOneUseCase.execute.mockResolvedValue(convenioRecord);

    const result = await service.findOne('1');

    expect(result.convenioId).toBe('1');
    expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(1n);
  });

  it('should validate convenio before returning installments', async () => {
    mockFindOneUseCase.execute.mockResolvedValue(convenioRecord);
    mockPrismaService.cuotaConvenio.findMany.mockResolvedValue([cuotaRecord]);

    const result = await service.findCuotas('1');

    expect(result).toEqual([
      expect.objectContaining({
        cuotaConvenioId: '1',
        convenioId: '1',
        numeroCuota: 1,
      }),
    ]);
    expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(1n);
    expect(mockPrismaService.cuotaConvenio.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { convenioId: 1n, deletedAt: null },
        orderBy: { numeroCuota: 'asc' },
      }),
    );
  });

  it('should cancel convenio with ANULADO status and soft delete date', async () => {
    mockFindOneUseCase.execute.mockResolvedValue(convenioRecord);
    mockPrismaService.estadoConvenio.findUnique.mockResolvedValue({
      estadoConvenioId: 9n,
    });
    mockPrismaService.convenios.update.mockResolvedValue({
      ...convenioRecord,
      estado: { estadoConvenioId: 9n, codigo: 'ANULADO', nombre: 'Anulado' },
    });

    const result = await service.cancel('1');

    expect(result.estado.codigo).toBe('ANULADO');
    expect(mockPrismaService.convenios.update).toHaveBeenCalledWith({
      where: { convenioId: 1n },
      data: {
        estadoConvenioId: 9n,
        deletedAt: expect.any(Date),
      },
      select: expect.any(Object),
    });
  });
});
