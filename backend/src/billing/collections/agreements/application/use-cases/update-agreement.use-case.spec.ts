import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { UpdateAgreementUseCase } from './update-agreement.use-case';
import { AgreementEntity } from '../../domain/entities/agreement.entity';

describe('UpdateAgreementUseCase', () => {
  let useCase: UpdateAgreementUseCase;

  const mockAgreementRepository = {
    findById: jest.fn(),
    markAsPaid: jest.fn(),
    updateState: jest.fn(),
  };

  const baseConvenio = new AgreementEntity({
    convenioId: 1n,
    estado: 'PENDIENTE_ABONO',
    deudaTotal: 100,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAgreementUseCase,
        { provide: AgreementRepository, useValue: mockAgreementRepository },
      ],
    }).compile();

    useCase = module.get<UpdateAgreementUseCase>(UpdateAgreementUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('PAGADO transition', () => {
    it('should delegate markAsPaid to repository', async () => {
      mockAgreementRepository.findById.mockResolvedValue(baseConvenio);
      mockAgreementRepository.markAsPaid.mockResolvedValue(
        new AgreementEntity({
          convenioId: 1n,
          estado: 'PAGADO',
          montoPagadoActual: 100,
        }),
      );

      const result = await useCase.execute(1n, 'PAGADO');

      expect(mockAgreementRepository.markAsPaid).toHaveBeenCalledWith(1n);
      expect(result.estado).toBe('PAGADO');
    });
  });

  describe('ANULADO transition', () => {
    it('should soft delete the convenio', async () => {
      mockAgreementRepository.findById.mockResolvedValue(baseConvenio);
      mockAgreementRepository.updateState.mockResolvedValue(
        new AgreementEntity({
          convenioId: 1n,
          estado: 'ANULADO',
          deletedAt: new Date(),
        }),
      );

      const result = await useCase.execute(1n, 'ANULADO');

      expect(result.estado).toBe('ANULADO');
      expect(mockAgreementRepository.updateState).toHaveBeenCalledWith(
        1n,
        'ANULADO',
        expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('ACTIVO transition', () => {
    it('should activate convenio and set approval date', async () => {
      mockAgreementRepository.findById.mockResolvedValue(baseConvenio);
      mockAgreementRepository.updateState.mockResolvedValue(
        new AgreementEntity({
          convenioId: 1n,
          estado: 'ACTIVO',
          fechaAprobacion: new Date(),
        }),
      );

      const result = await useCase.execute(1n, 'ACTIVO');

      expect(result.estado).toBe('ACTIVO');
      expect(mockAgreementRepository.updateState).toHaveBeenCalledWith(
        1n,
        'ACTIVO',
        expect.objectContaining({
          fechaAprobacion: expect.any(Date),
        }),
      );
    });
  });

  describe('validations', () => {
    it('should throw NotFoundException when convenio does not exist', async () => {
      mockAgreementRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999n, 'PAGADO')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when estado is the same', async () => {
      mockAgreementRepository.findById.mockResolvedValue(baseConvenio);

      await expect(useCase.execute(1n, 'PENDIENTE_ABONO')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when convenio is already PAGADO', async () => {
      mockAgreementRepository.findById.mockResolvedValue(
        new AgreementEntity({
          ...baseConvenio,
          estado: 'PAGADO',
        }),
      );

      await expect(useCase.execute(1n, 'ANULADO')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when convenio is already ANULADO', async () => {
      mockAgreementRepository.findById.mockResolvedValue(
        new AgreementEntity({
          ...baseConvenio,
          estado: 'ANULADO',
        }),
      );

      await expect(useCase.execute(1n, 'ACTIVO')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for unsupported transitions', async () => {
      mockAgreementRepository.findById.mockResolvedValue(baseConvenio);

      await expect(useCase.execute(1n, 'PAGADA')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
