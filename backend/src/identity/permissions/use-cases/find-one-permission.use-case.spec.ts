import { Test, TestingModule } from '@nestjs/testing';
import { FindOnePermissionUseCase } from './find-one-permission.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FindOnePermissionUseCase', () => {
  let useCase: FindOnePermissionUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    permissions: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOnePermissionUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<FindOnePermissionUseCase>(FindOnePermissionUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return a permission', async () => {
    mockPrisma.permissions.findUnique.mockResolvedValue({ permissionsId: 1, resource: 'Users', action: 'Read', deletedAt: null });

    const result = await useCase.execute(1);

    expect(result).toEqual({ permissionsId: 1, resource: 'Users', action: 'Read', deletedAt: null });
  });

  it('should throw NotFoundException if permission does not exist', async () => {
    mockPrisma.permissions.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if permission is deleted', async () => {
    mockPrisma.permissions.findUnique.mockResolvedValue({ permissionsId: 1, deletedAt: new Date() });

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
