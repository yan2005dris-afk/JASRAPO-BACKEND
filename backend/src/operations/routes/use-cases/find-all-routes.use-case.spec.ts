import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllRoutesUseCase } from './find-all-routes.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('FindAllRoutesUseCase', () => {
  let useCase: FindAllRoutesUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllRoutesUseCase,
        {
          provide: PrismaService,
          useValue: {
            rutas: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<FindAllRoutesUseCase>(FindAllRoutesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });
});
