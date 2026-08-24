import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPaymentAgreementPdfDataUseCase } from './get-payment-agreement-pdf-data.use-case';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';

const mockPdfData = {
  convenio: {
    convenioId: '1',
    contratoId: '5',
    deudaTotal: 500.0,
    abonoInicial: 100.0,
    numeroCuotas: 4,
    fechaPrimerPago: new Date('2024-02-01').toISOString(),
    periodoInicio: new Date('2020-01-01').toISOString(),
    motivo: 'Deuda acumulada',
    createdAt: new Date('2024-01-15').toISOString(),
    cuotaMensual: 100.0,
    primeraCuota: 100.0,
    contrato: {
      numeroGuia: 'NG-001',
      direccionSuministro: 'Av. Principal 123',
    },
    cliente: {
      nombres: 'María',
      apellidos: 'García',
      razonSocial: null,
      identificacion: '0912345678',
    },
  },
};

describe('GetPaymentAgreementPdfDataUseCase', () => {
  let useCase: GetPaymentAgreementPdfDataUseCase;

  const mockAgreementRepository = {
    getPdfData: jest.fn(),
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
      mockAgreementRepository.getPdfData.mockResolvedValue(null);
      await expect(useCase.execute(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return correctly mapped convenio data', async () => {
      mockAgreementRepository.getPdfData.mockResolvedValue(mockPdfData);
      const result = await useCase.execute(BigInt(1));

      expect(result.convenio.convenioId).toBe('1');
      expect(result.convenio.contratoId).toBe('5');
      expect(result.convenio.deudaTotal).toBe(500);
      expect(result.convenio.abonoInicial).toBe(100);
      expect(result.convenio.numeroCuotas).toBe(4);
      expect(result.convenio.motivo).toBe('Deuda acumulada');
      expect(result.convenio.cuotaMensual).toBe(100);
    });
  });
});
