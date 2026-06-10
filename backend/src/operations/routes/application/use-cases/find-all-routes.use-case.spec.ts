import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllRoutesUseCase } from './find-all-routes.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('FindAllRoutesUseCase', () => {
  let useCase: FindAllRoutesUseCase;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      rutas: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllRoutesUseCase,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    useCase = module.get<FindAllRoutesUseCase>(FindAllRoutesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call count and findMany with correct params and map results', async () => {
    prismaService.rutas.count.mockResolvedValue(2);
    prismaService.rutas.findMany.mockResolvedValue([
      { rutaId: 1n, nombre: 'Route 1' },
      { rutaId: 2n, nombre: 'Route 2' },
    ]);

    const result = await useCase.execute({
      pagination: { page: 1, limit: 10 },
      where: { estado: 'PENDIENTE' },
    });

    expect(prismaService.rutas.count).toHaveBeenCalledWith({
      where: { estado: 'PENDIENTE', deletedAt: null },
    });
    expect(prismaService.rutas.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: { estado: 'PENDIENTE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    expect(result.meta.total).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].rutaId).toBe(1n);
    expect(result.data[0].nombre).toBe('Route 1');
  });
});
