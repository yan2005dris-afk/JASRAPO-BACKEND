import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RevokePermissionFromUserUseCase } from './revoke-permission-from-user.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('RevokePermissionFromUserUseCase', () => {
  let useCase: RevokePermissionFromUserUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    userPermissions: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokePermissionFromUserUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<RevokePermissionFromUserUseCase>(
      RevokePermissionFromUserUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should soft delete user permission', async () => {
    mockPrisma.userPermissions.findUnique.mockResolvedValue({
      idUserPermissions: 1,
      deletedAt: null,
    });
    mockPrisma.userPermissions.update.mockResolvedValue({
      idUserPermissions: 1,
      deletedAt: new Date(),
    });

    await useCase.execute(1);

    expect(mockPrisma.userPermissions.update).toHaveBeenCalledWith({
      where: { idUserPermissions: 1 },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should throw NotFoundException if permission not found', async () => {
    mockPrisma.userPermissions.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException if already revoked', async () => {
    mockPrisma.userPermissions.findUnique.mockResolvedValue({
      idUserPermissions: 1,
      deletedAt: new Date(),
    });

    await expect(useCase.execute(1)).rejects.toThrow(ConflictException);
  });
});
