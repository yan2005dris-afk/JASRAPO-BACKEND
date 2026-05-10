import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetEligibleReadingsUseCase } from './get-eligible-readings.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GetEligibleReadingsUseCase', () => {
  let useCase: GetEligibleReadingsUseCase;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      comunidades: { findUnique: jest.fn() },
      sectores: { findUnique: jest.fn() },
      lecturas: { count: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEligibleReadingsUseCase,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    useCase = module.get<GetEligibleReadingsUseCase>(
      GetEligibleReadingsUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if comunidad not found', async () => {
    prismaService.comunidades.findUnique.mockResolvedValue(null);
    await expect(
      useCase.execute({ tipoRuta: 'TOMA_LECTURA', comunidadId: 1 }),
    ).rejects.toThrow(NotFoundException);
  });
});
