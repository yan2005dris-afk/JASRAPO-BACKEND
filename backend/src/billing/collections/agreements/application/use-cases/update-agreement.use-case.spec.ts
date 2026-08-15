import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { UpdateAgreementUseCase } from './update-agreement.use-case';

describe('UpdateAgreementUseCase', () => {
  let useCase: UpdateAgreementUseCase;

  const mockAgreementRepository = {
    findFirstConvenio: jest.fn(),
    findUniqueConvenio: jest.fn(),
    findManyConvenios: jest.fn(),
    createConvenio: jest.fn(),
    updateConvenio: jest.fn(),
    findFirstContrato: jest.fn(),
    findFirstParametroTasainteres: jest.fn(),
    findManyPrefacturas: jest.fn(),
    findManyCuotaConvenio: jest.fn(),
    executeTransaction: jest.fn(),
  };

  const baseConvenio = {
    convenioId: 1n,
    estado: 'PENDIENTE_ABONO' as const,
    deudaTotal: 100,
  };

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
    it('should mark all pending installments as paid and update convenio', async () => {
      const tx = {
        cuotaConvenio: {
          findMany: jest.fn().mockResolvedValue([
            {
              cuotaConvenioId: 10n,
              valorCuota: 50,
            },
            {
              cuotaConvenioId: 11n,
              valorCuota: 50,
            },
          ]),
          update: jest.fn(),
        },
        convenios: {
          update: jest.fn().mockResolvedValue({
            convenioId: 1n,
            estado: 'PAGADO',
            fechaProximoPago: null,
            montoPagadoActual: 100,
          }),
        },
      };

      mockAgreementRepository.findFirstConvenio.mockResolvedValue(baseConvenio);
      mockAgreementRepository.executeTransaction.mockImplementation(
        (callback) => callback(tx),
      );

      const result = await useCase.execute(1n, 'PAGADO');

      expect(tx.cuotaConvenio.update).toHaveBeenCalledTimes(2);
      expect(tx.cuotaConvenio.update).toHaveBeenCalledWith({
        where: { cuotaConvenioId: 10n },
        data: expect.objectContaining({
          estado: 'PAGADA',
          montoPagado: 50,
          saldoPendiente: 0,
          pagoCompleto: true,
          diasRetraso: 0,
        }),
      });
      expect(tx.convenios.update).toHaveBeenCalledWith({
        where: { convenioId: 1n },
        data: {
          estado: 'PAGADO',
          fechaProximoPago: null,
          montoPagadoActual: 100,
        },
      });
      expect(result.montoPagadoActual).toBe(100);
    });

    it('should handle convenio with no pending installments', async () => {
      const tx = {
        cuotaConvenio: {
          findMany: jest.fn().mockResolvedValue([]),
          update: jest.fn(),
        },
        convenios: {
          update: jest.fn().mockResolvedValue({
            convenioId: 1n,
            estado: 'PAGADO',
          }),
        },
      };

      mockAgreementRepository.findFirstConvenio.mockResolvedValue(baseConvenio);
      mockAgreementRepository.executeTransaction.mockImplementation(
        (callback) => callback(tx),
      );

      const result = await useCase.execute(1n, 'PAGADO');

      expect(tx.cuotaConvenio.update).not.toHaveBeenCalled();
      expect(result.estado).toBe('PAGADO');
    });
  });

  describe('ANULADO transition', () => {
    it('should soft delete the convenio', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue(baseConvenio);
      mockAgreementRepository.updateConvenio.mockResolvedValue({
        convenioId: 1n,
        estado: 'ANULADO',
        deletedAt: new Date(),
      });

      const result = await useCase.execute(1n, 'ANULADO');

      expect(result.estado).toBe('ANULADO');
      expect(mockAgreementRepository.updateConvenio).toHaveBeenCalledWith(
        { convenioId: 1n },
        expect.objectContaining({
          estado: 'ANULADO',
          deletedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('ACTIVO transition', () => {
    it('should activate convenio and set approval date', async () => {
      mockAgreementRepository.findFirstConvenio
        .mockResolvedValueOnce(baseConvenio) // primer find para validación
        .mockResolvedValueOnce({ fechaAprobacion: null }); // segundo find en ejecutarActivacion

      mockAgreementRepository.updateConvenio.mockResolvedValue({
        convenioId: 1n,
        estado: 'ACTIVO',
        fechaAprobacion: expect.any(Date),
      });

      const result = await useCase.execute(1n, 'ACTIVO');

      expect(result.estado).toBe('ACTIVO');
      expect(mockAgreementRepository.updateConvenio).toHaveBeenCalledWith(
        { convenioId: 1n },
        expect.objectContaining({
          estado: 'ACTIVO',
          fechaAprobacion: expect.any(Date),
        }),
      );
    });

    it('should keep existing approval date when already set', async () => {
      const existingDate = new Date('2026-06-01');

      mockAgreementRepository.findFirstConvenio
        .mockResolvedValueOnce({
          ...baseConvenio,
          estado: 'PREPARADO',
        })
        .mockResolvedValueOnce({ fechaAprobacion: existingDate });

      mockAgreementRepository.updateConvenio.mockResolvedValue({
        convenioId: 1n,
        estado: 'ACTIVO',
        fechaAprobacion: existingDate,
      });

      const result = await useCase.execute(1n, 'ACTIVO');

      expect(result.estado).toBe('ACTIVO');
      expect(mockAgreementRepository.updateConvenio).toHaveBeenCalledWith(
        { convenioId: 1n },
        {
          estado: 'ACTIVO',
          fechaAprobacion: existingDate,
        },
      );
    });
  });

  describe('validations', () => {
    it('should throw NotFoundException when convenio does not exist', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue(null);

      await expect(useCase.execute(999n, 'PAGADO')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when estado is the same', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue(baseConvenio);

      await expect(useCase.execute(1n, 'PENDIENTE_ABONO')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when convenio is already PAGADO', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue({
        ...baseConvenio,
        estado: 'PAGADO',
      });

      await expect(useCase.execute(1n, 'ANULADO')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when convenio is already ANULADO', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue({
        ...baseConvenio,
        estado: 'ANULADO',
      });

      await expect(useCase.execute(1n, 'ACTIVO')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for unsupported transitions', async () => {
      mockAgreementRepository.findFirstConvenio.mockResolvedValue(baseConvenio);

      await expect(useCase.execute(1n, 'PAGADA')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
