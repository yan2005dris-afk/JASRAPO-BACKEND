import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UpdateAgreementUseCase } from './update-agreement.use-case';

describe('UpdateAgreementUseCase', () => {
  let useCase: UpdateAgreementUseCase;

  const mockPrismaService = {
    convenios: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
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
        { provide: PrismaService, useValue: mockPrismaService },
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

      mockPrismaService.convenios.findFirst.mockResolvedValue(baseConvenio);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(tx),
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
        select: expect.any(Object),
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

      mockPrismaService.convenios.findFirst.mockResolvedValue(baseConvenio);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(tx),
      );

      const result = await useCase.execute(1n, 'PAGADO');

      expect(tx.cuotaConvenio.update).not.toHaveBeenCalled();
      expect(result.estado).toBe('PAGADO');
    });
  });

  describe('ANULADO transition', () => {
    it('should soft delete the convenio', async () => {
      mockPrismaService.convenios.findFirst.mockResolvedValue(baseConvenio);
      mockPrismaService.convenios.update.mockResolvedValue({
        convenioId: 1n,
        estado: 'ANULADO',
        deletedAt: new Date(),
      });

      const result = await useCase.execute(1n, 'ANULADO');

      expect(result.estado).toBe('ANULADO');
      expect(mockPrismaService.convenios.update).toHaveBeenCalledWith({
        where: { convenioId: 1n },
        data: expect.objectContaining({
          estado: 'ANULADO',
          deletedAt: expect.any(Date),
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('ACTIVO transition', () => {
    it('should activate convenio and set approval date', async () => {
      mockPrismaService.convenios.findFirst
        .mockResolvedValueOnce(baseConvenio) // primer find para validación
        .mockResolvedValueOnce({ fechaAprobacion: null }); // segundo find en ejecutarActivacion

      mockPrismaService.convenios.update.mockResolvedValue({
        convenioId: 1n,
        estado: 'ACTIVO',
        fechaAprobacion: expect.any(Date),
      });

      const result = await useCase.execute(1n, 'ACTIVO');

      expect(result.estado).toBe('ACTIVO');
      expect(mockPrismaService.convenios.update).toHaveBeenCalledWith({
        where: { convenioId: 1n },
        data: expect.objectContaining({
          estado: 'ACTIVO',
          fechaAprobacion: expect.any(Date),
        }),
        select: expect.any(Object),
      });
    });

    it('should keep existing approval date when already set', async () => {
      const existingDate = new Date('2026-06-01');

      mockPrismaService.convenios.findFirst
        .mockResolvedValueOnce({
          ...baseConvenio,
          estado: 'PREPARADO',
        })
        .mockResolvedValueOnce({ fechaAprobacion: existingDate });

      mockPrismaService.convenios.update.mockResolvedValue({
        convenioId: 1n,
        estado: 'ACTIVO',
        fechaAprobacion: existingDate,
      });

      const result = await useCase.execute(1n, 'ACTIVO');

      expect(result.estado).toBe('ACTIVO');
      expect(mockPrismaService.convenios.update).toHaveBeenCalledWith({
        where: { convenioId: 1n },
        data: {
          estado: 'ACTIVO',
          fechaAprobacion: existingDate,
        },
        select: expect.any(Object),
      });
    });
  });

  describe('validations', () => {
    it('should throw NotFoundException when convenio does not exist', async () => {
      mockPrismaService.convenios.findFirst.mockResolvedValue(null);

      await expect(useCase.execute(999n, 'PAGADO')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when estado is the same', async () => {
      mockPrismaService.convenios.findFirst.mockResolvedValue(baseConvenio);

      await expect(useCase.execute(1n, 'PENDIENTE_ABONO')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when convenio is already PAGADO', async () => {
      mockPrismaService.convenios.findFirst.mockResolvedValue({
        ...baseConvenio,
        estado: 'PAGADO',
      });

      await expect(useCase.execute(1n, 'ANULADO')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when convenio is already ANULADO', async () => {
      mockPrismaService.convenios.findFirst.mockResolvedValue({
        ...baseConvenio,
        estado: 'ANULADO',
      });

      await expect(useCase.execute(1n, 'ACTIVO')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for unsupported transitions', async () => {
      mockPrismaService.convenios.findFirst.mockResolvedValue(baseConvenio);

      await expect(useCase.execute(1n, 'PAGADA')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
