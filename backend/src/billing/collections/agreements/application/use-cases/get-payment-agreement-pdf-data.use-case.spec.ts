import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPaymentAgreementPdfDataUseCase } from './get-payment-agreement-pdf-data.use-case';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';

const makeConvenio = (overrides: Record<string, any> = {}) => ({
  convenioId: BigInt(1),
  contratoId: BigInt(5),
  deudaTotal: 500.0,
  abonoInicial: 100.0,
  numeroCuotas: 4,
  fechaPrimerPago: new Date('2024-02-01'),
  motivo: 'Deuda acumulada',
  createdAt: new Date('2024-01-15'),
  cuotaConvenio: [{ valorCuota: 100.0 }],
  contrato: {
    numeroGuia: 'NG-001',
    direccionSuministro: 'Av. Principal 123',
    cliente: {
      nombres: 'María',
      apellidos: 'García',
      razonSocial: null,
      identificacion: '0912345678',
    },
  },
  ...overrides,
});

describe('GetPaymentAgreementPdfDataUseCase', () => {
  let useCase: GetPaymentAgreementPdfDataUseCase;

  const mockAgreementRepository = {
    findFirstConvenio: jest.fn(),
    findUniqueConvenio: jest.fn(),
    findManyConvenios: jest.fn(),
    createConvenio: jest.fn(),
    updateConvenio: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPaymentAgreementPdfDataUseCase,
        { provide: AgreementRepository, useValue: mockAgreementRepository },
      ],
    }).compile();

    useCase = module.get<GetPaymentAgreementPdfDataUseCase>(
      GetPaymentAgreementPdfDataUseCase,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when convenio not found', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue(null);
      await expect(useCase.execute(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call repository with correct where clause', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue(
        makeConvenio(),
      );
      await useCase.execute(BigInt(1));
      expect(mockAgreementRepository.findFirstConvenio).toHaveBeenCalledWith(
        { convenioId: BigInt(1), deletedAt: null },
        expect.any(Object),
      );
    });

    it('should return correctly mapped convenio data', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue(
        makeConvenio(),
      );
      const result = await useCase.execute(BigInt(1));

      expect(result.convenio.convenioId).toBe('1');
      expect(result.convenio.contratoId).toBe('5');
      expect(result.convenio.deudaTotal).toBe(500);
      expect(result.convenio.abonoInicial).toBe(100);
      expect(result.convenio.numeroCuotas).toBe(4);
      expect(result.convenio.motivo).toBe('Deuda acumulada');
      expect(result.convenio.cuotaMensual).toBe(100);
    });

    it('should set cuotaMensual=0 when cuotaConvenio is empty', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue(
        makeConvenio({ cuotaConvenio: [] }),
      );
      const result = await useCase.execute(BigInt(1));
      expect(result.convenio.cuotaMensual).toBe(0);
    });

    it('should return ISO string for fechaPrimerPago and createdAt', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue(
        makeConvenio(),
      );
      const result = await useCase.execute(BigInt(1));
      expect(result.convenio.fechaPrimerPago).toBe(
        new Date('2024-02-01').toISOString(),
      );
      expect(result.convenio.createdAt).toBe(
        new Date('2024-01-15').toISOString(),
      );
    });

    it('should map cliente and contrato fields', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue(
        makeConvenio(),
      );
      const result = await useCase.execute(BigInt(1));

      expect(result.convenio.cliente.nombres).toBe('María');
      expect(result.convenio.cliente.apellidos).toBe('García');
      expect(result.convenio.cliente.identificacion).toBe('0912345678');
      expect(result.convenio.cliente.razonSocial).toBeNull();
      expect(result.convenio.contrato.numeroGuia).toBe('NG-001');
      expect(result.convenio.contrato.direccionSuministro).toBe(
        'Av. Principal 123',
      );
    });
  });
});
