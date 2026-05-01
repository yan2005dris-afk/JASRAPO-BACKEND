import { Test, TestingModule } from '@nestjs/testing';
import { RemovePermissionFromRoleUseCase } from './remove-permission-from-role.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RemovePermissionFromRoleUseCase', () => {
  let useCase: RemovePermissionFromRoleUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    rolPermissions: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemovePermissionFromRoleUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<RemovePermissionFromRoleUseCase>(RemovePermissionFromRoleUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should remove a permission from a role', async () => {
    mockPrisma.rolPermissions.findFirst.mockResolvedValue({ rolPermissionsId: 100 });
    mockPrisma.rolPermissions.update.mockResolvedValue({ permissionsId: 10 });

    const result = await useCase.execute(1, 10);

    expect(result).toEqual({ permissionsId: 10 });
    expect(prisma.rolPermissions.update).toHaveBeenCalled();
  });

  it('should throw NotFoundException if not assigned', async () => {
    mockPrisma.rolPermissions.findFirst.mockResolvedValue(null);

    await expect(useCase.execute(1, 10)).rejects.toThrow(NotFoundException);
  });
});
