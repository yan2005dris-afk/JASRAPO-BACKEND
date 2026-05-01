import { Test, TestingModule } from '@nestjs/testing';
import { SearchCustomersUseCase } from './search-customers.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('SearchCustomersUseCase', () => {
  let useCase: SearchCustomersUseCase;

  const mockPrismaService = {
    clientes: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchCustomersUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<SearchCustomersUseCase>(SearchCustomersUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should search by identification', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([]);
      await useCase.execute('identificacion', '092');

      expect(mockPrismaService.clientes.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          identificacion: { contains: '092', mode: 'insensitive' }
        })
      }));
    });

    it('should throw BadRequestException if identification search term is too short', async () => {
      await expect(useCase.execute('identificacion', '09')).rejects.toThrow(BadRequestException);
    });

    it('should search by name', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([]);
      await useCase.execute('nombres', 'John');

      expect(mockPrismaService.clientes.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          nombres: { contains: 'John', mode: 'insensitive' }
        })
      }));
    });

    it('should search by full name', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([]);
      await useCase.execute('nombreCompleto', 'John Doe');

      expect(mockPrismaService.clientes.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          AND: [
            expect.any(Object),
            expect.any(Object),
          ]
        })
      }));
    });
  });
});
