import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PublicSearchUseCase } from './public-search.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PublicSearchUseCase', () => {
  let useCase: PublicSearchUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    clientes: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    contratos: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicSearchUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<PublicSearchUseCase>(PublicSearchUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw BadRequestException if tipo or valor are missing', async () => {
    await expect(useCase.execute('', '')).rejects.toThrow(BadRequestException);
    await expect(useCase.execute('cliente', '')).rejects.toThrow(
      BadRequestException,
    );
    await expect(useCase.execute('', 'valor')).rejects.toThrow(
      BadRequestException,
    );
  });

  describe('search by cliente', () => {
    it('should return paginated clients by identification', async () => {
      const mockClientes = [
        {
          clienteId: 1,
          nombres: 'John',
          apellidos: 'Doe',
          identificacion: '1234567890',
        },
      ];
      mockPrismaService.$transaction.mockResolvedValue([mockClientes, 1]);

      const result = await useCase.execute('cliente', '1234567890');

      expect(result.data[0].label).toBe('John Doe');
      expect(result.meta.total).toBe(1);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should return paginated clients by name tokens', async () => {
      const mockClientes = [
        {
          clienteId: 1,
          nombres: 'John',
          apellidos: 'Doe',
          identificacion: '1234567890',
        },
      ];
      mockPrismaService.$transaction.mockResolvedValue([mockClientes, 1]);

      const result = await useCase.execute('cliente', 'John Doe');

      expect(result.data[0].label).toBe('John Doe');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('search by contrato', () => {
    it('should return paginated contracts', async () => {
      const mockContratos = [
        {
          contratoId: 1,
          numeroGuia: 'G-001',
          cliente: { nombres: 'John', apellidos: 'Doe' },
        },
      ];
      mockPrismaService.$transaction.mockResolvedValue([mockContratos, 1]);

      const result = await useCase.execute('contrato', 'G-001');

      expect(result.data[0].label).toBe('G-001');
      expect(result.data[0].extra.cliente).toBe('John Doe');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('global search', () => {
    it('should return mixed results from both clients and contracts', async () => {
      const mockClientes = [
        { clienteId: 1, nombres: 'John', apellidos: 'Doe' },
      ];
      const mockContratos = [
        {
          contratoId: 1,
          numeroGuia: 'G-001',
          cliente: { nombres: 'Jane', apellidos: 'Smith' },
        },
      ];
      mockPrismaService.clientes.findMany.mockResolvedValue(mockClientes);
      mockPrismaService.contratos.findMany.mockResolvedValue(mockContratos);

      const result = await useCase.execute('global', 'test');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].tipo).toBe('cliente');
      expect(result.data[1].tipo).toBe('contrato');
    });
  });

  it('should throw BadRequestException for invalid search type', async () => {
    await expect(useCase.execute('invalid', 'valor')).rejects.toThrow(
      'Tipo de búsqueda inválido',
    );
  });
});
