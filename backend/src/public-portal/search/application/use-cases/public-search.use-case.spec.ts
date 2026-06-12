import { BadRequestException } from '@nestjs/common';
import { PublicSearchUseCase } from './public-search.use-case';
import { SearchResultEntity } from '../../domain/entities/public-search-result.entity';
import type { SearchFilters } from '../../domain/types/public-search-filters';

describe('PublicSearchUseCase', () => {
  const makeClienteEntity = (id: string, label: string) =>
    new SearchResultEntity('cliente', id, label, {
      identificacion: `ID-${id}`,
      telefono: null,
      email: null,
    });

  const makeContratoEntity = (id: string, label: string) =>
    new SearchResultEntity('contrato', id, label, {
      cliente: `Cliente ${id}`,
      identificacionCliente: `ID-${id}`,
      estado: 'ACTIVO',
      direccion: 'Dirección',
    });

  const createMockRepo = () => ({
    findManyClientes: jest.fn<
      Promise<SearchResultEntity[]>,
      [SearchFilters, number, number]
    >(),
    countClientes: jest.fn<Promise<number>, [SearchFilters]>(),
    findManyContratos: jest.fn<
      Promise<SearchResultEntity[]>,
      [SearchFilters, number, number]
    >(),
    countContratos: jest.fn<Promise<number>, [SearchFilters]>(),
    findContratosDeudaBy: jest.fn().mockResolvedValue([]),
    countContratosDeuda: jest.fn().mockResolvedValue(0),
  });

  describe('cliente search', () => {
    it('should return mapped clientes with correct meta', async () => {
      const mockRepo = createMockRepo();
      const useCase = new PublicSearchUseCase(mockRepo);

      mockRepo.findManyClientes.mockResolvedValue([
        makeClienteEntity('1', 'Juan Perez'),
      ]);
      mockRepo.countClientes.mockResolvedValue(1);

      const result = await useCase.execute('cliente', 'juan', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].tipo).toBe('cliente');
      expect(result.data[0].label).toBe('Juan Perez');
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10 });

      // Verify repo was called with SearchFilters
      const filtersArg: SearchFilters =
        mockRepo.findManyClientes.mock.calls[0][0];
      expect(filtersArg.valor).toBe('juan');
    });

    it('should apply default pagination when not provided', async () => {
      const mockRepo = createMockRepo();
      const useCase = new PublicSearchUseCase(mockRepo);

      mockRepo.findManyClientes.mockResolvedValue([]);
      mockRepo.countClientes.mockResolvedValue(0);

      await useCase.execute('cliente', 'test', undefined, undefined);

      const filtersArg: SearchFilters =
        mockRepo.findManyClientes.mock.calls[0][0];
      expect(filtersArg.valor).toBe('test');
    });
  });

  describe('contrato search', () => {
    it('should return mapped contratos with correct meta', async () => {
      const mockRepo = createMockRepo();
      const useCase = new PublicSearchUseCase(mockRepo);

      mockRepo.findManyContratos.mockResolvedValue([
        makeContratoEntity('42', 'G-2024-001'),
      ]);
      mockRepo.countContratos.mockResolvedValue(1);

      const result = await useCase.execute('contrato', 'G-2024', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].tipo).toBe('contrato');
      expect(result.data[0].label).toBe('G-2024-001');
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10 });
    });
  });

  describe('global search', () => {
    it('should merge clientes and contratos results', async () => {
      const mockRepo = createMockRepo();
      const useCase = new PublicSearchUseCase(mockRepo);

      mockRepo.findManyClientes.mockResolvedValue([
        makeClienteEntity('1', 'Juan Perez'),
      ]);
      mockRepo.findManyContratos.mockResolvedValue([
        makeContratoEntity('42', 'G-2024-001'),
      ]);

      const result = await useCase.execute('global', 'test', 1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].tipo).toBe('cliente');
      expect(result.data[1].tipo).toBe('contrato');
      expect(result.meta.total).toBe(2);
    });
  });

  describe('validation', () => {
    it('should throw BadRequestException when tipo is empty', async () => {
      const mockRepo = createMockRepo();
      const useCase = new PublicSearchUseCase(mockRepo);

      await expect(useCase.execute('', 'test', 1, 10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when valor is empty', async () => {
      const mockRepo = createMockRepo();
      const useCase = new PublicSearchUseCase(mockRepo);

      await expect(useCase.execute('cliente', '', 1, 10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid tipo', async () => {
      const mockRepo = createMockRepo();
      const useCase = new PublicSearchUseCase(mockRepo);

      await expect(useCase.execute('invalid', 'test', 1, 10)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('pagination', () => {
    it('should cap limit at 50', async () => {
      const mockRepo = createMockRepo();
      const useCase = new PublicSearchUseCase(mockRepo);

      mockRepo.findManyClientes.mockResolvedValue([]);
      mockRepo.countClientes.mockResolvedValue(0);

      await useCase.execute('cliente', 'test', 1, 100);

      // take should be 50, not 100
      const takeArg = mockRepo.findManyClientes.mock.calls[0][2];
      expect(takeArg).toBe(50);
    });
  });
});
