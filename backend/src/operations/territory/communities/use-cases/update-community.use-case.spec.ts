import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateCommunityUseCase } from './update-community.use-case';

describe('UpdateCommunityUseCase', () => {
  let useCase: UpdateCommunityUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    comunidades: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCommunityUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<UpdateCommunityUseCase>(UpdateCommunityUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should update a community', async () => {
    const id = 1;
    const dto = { nombre: 'Comunidad Updated' };
    mockPrismaService.comunidades.update.mockResolvedValue({ comunidadId: id, ...dto });

    const result = await useCase.execute(id, dto);

    expect(result).toEqual({ comunidadId: id, ...dto });
    expect(prisma.comunidades.update).toHaveBeenCalledWith({
      where: { comunidadId: id },
      data: dto,
    });
  });
});
