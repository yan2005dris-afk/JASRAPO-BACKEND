import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { paginate } from 'src/infrastructure/common/utils/pagination.util';
import { CreateAgreementUseCase } from './use-cases/create-agreement.use-case';
import { FindOneAgreementUseCase } from './use-cases/find-one-agreement.use-case';
import { GetDebtSummaryUseCase } from './use-cases/get-debt-summary.use-case';
import { UpdateAgreementUseCase } from './use-cases/update-agreement.use-case';
import { AgreementsService } from './agreements.service';

jest.mock('src/infrastructure/common/utils/pagination.util');

describe('AgreementsService', () => {
  let service: AgreementsService;

  const mockPrismaService = {
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
  const mockUpdateUseCase = { execute: jest.fn() };

  const convenioRecord = {
    convenioId: 1n,
    contratoId: 10n,
    numeroCuotas: 2,
    abonoInicial: 5,
    deudaTotal: 100,
    mesesMoraActual: 1,
    estado: 'PREPARADO',
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
    estado: 'PENDIENTE',
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
        AgreementsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CreateAgreementUseCase, useValue: mockCreateUseCase },
        { provide: FindOneAgreementUseCase, useValue: mockFindOneUseCase },
        { provide: GetDebtSummaryUseCase, useValue: mockGetDebtSummaryUseCase },
        { provide: UpdateAgreementUseCase, useValue: mockUpdateUseCase },
      ],
    }).compile();

    service = module.get<AgreementsService>(AgreementsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return active agreement states mapped from enum', async () => {
    const result = await service.findAllAgreementStates();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ codigo: 'ACTIVO' }),
        expect.objectContaining({ codigo: 'PENDIENTE_ABONO' }),
        expect.objectContaining({ codigo: 'PREPARADO' }),
        expect.objectContaining({ codigo: 'ANULADO' }),
        expect.objectContaining({ codigo: 'PAGADO' }),
      ]),
    );
    expect(result).toHaveLength(5);
  });

  it('should return active installment states mapped from enum', async () => {
    const result = await service.findAllInstallmentStates();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ codigo: 'PENDIENTE' }),
        expect.objectContaining({ codigo: 'PAGADA' }),
      ]),
    );
    expect(result).toHaveLength(2);
  });

  it('should delegate debt summary with contratoId as bigint', async () => {
    mockGetDebtSummaryUseCase.execute.mockResolvedValue({ contratoId: '10' });

    const result = await service.getDebtSummary(10n);

    expect(result).toEqual({ contratoId: '10' });
    expect(mockGetDebtSummaryUseCase.execute).toHaveBeenCalledWith(10n);
  });

  it('should create agreement through use case and map response', async () => {
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

  it('should return paginated agreements without contrato filter', async () => {
    const paginatedResult = {
      data: [convenioRecord],
      meta: {
        total: 1,
        paginaActual: 1,
        porPagina: 10,
        ultimaPagina: 1,
        anterior: null,
        siguiente: null,
      },
    };
    (paginate as jest.Mock).mockResolvedValue(paginatedResult);

    const result = await service.findAll({
      pagination: { page: 1, limit: 10 },
    });

    expect(result.meta.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].convenioId).toBe('1');
    expect(paginate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
      { page: 1, limit: 10 },
    );
  });

  it('should return paginated agreements by contrato filter', async () => {
    const paginatedResult = {
      data: [convenioRecord],
      meta: {
        total: 1,
        paginaActual: 1,
        porPagina: 10,
        ultimaPagina: 1,
        anterior: null,
        siguiente: null,
      },
    };
    (paginate as jest.Mock).mockResolvedValue(paginatedResult);

    const result = await service.findAll({
      pagination: { page: 1, limit: 10 },
      contratoId: '10',
    });

    expect(result.data).toHaveLength(1);
    expect(paginate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        where: { deletedAt: null, contratoId: 10n },
      }),
      { page: 1, limit: 10 },
    );
  });

  it('should find one agreement through use case and map response', async () => {
    mockFindOneUseCase.execute.mockResolvedValue(convenioRecord);

    const result = await service.findOne(1n);

    expect(result.convenioId).toBe('1');
    expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(1n);
  });

  it('should validate agreement before returning installments', async () => {
    mockFindOneUseCase.execute.mockResolvedValue(convenioRecord);
    mockPrismaService.cuotaConvenio.findMany.mockResolvedValue([cuotaRecord]);

    const result = await service.findInstallments('1');

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

  it('should update agreement estado through use case and map response', async () => {
    const updatedRecord = {
      ...convenioRecord,
      estado: 'PAGADO',
      fechaProximoPago: null,
      cuotaConvenio: [{ ...cuotaRecord, estado: 'PAGADA' }],
    };
    mockUpdateUseCase.execute.mockResolvedValue(updatedRecord);

    const result = await service.update(1n, { estado: 'PAGADO' });

    expect(result.estado.codigo).toBe('PAGADO');
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(1n, 'PAGADO');
  });

  it('should cancel agreement with ANULADO status and soft delete date', async () => {
    mockFindOneUseCase.execute.mockResolvedValue(convenioRecord);
    mockPrismaService.convenios.update.mockResolvedValue({
      ...convenioRecord,
      estado: 'ANULADO',
    });

    const result = await service.cancel(1n);

    expect(result.estado.codigo).toBe('ANULADO');
    expect(mockPrismaService.convenios.update).toHaveBeenCalledWith({
      where: { convenioId: 1n },
      data: {
        estado: 'ANULADO',
        deletedAt: expect.any(Date),
      },
      select: expect.any(Object),
    });
  });
});
