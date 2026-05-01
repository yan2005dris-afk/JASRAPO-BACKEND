import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { RemovePermissionUseCase } from './remove-permission.use-case';

describe('RemovePermissionUseCase', () => {
  let useCase: RemovePermissionUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemovePermissionUseCase,
        {
          provide: PrismaService,
          useValue: {
            permissions: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<RemovePermissionUseCase>(RemovePermissionUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete a permission', async () => {
    const id = 1;
    const expectedResult = {
      permissionsId: id,
      resource: 'test',
      action: 'test',
    };
    (prismaService.permissions.update as jest.fn).mockResolvedValue(
      expectedResult,
    );

    const result = await useCase.execute(id);

    expect(prismaService.permissions.update).toHaveBeenCalledWith({
      where: { permissionsId: id },
      data: { deletedAt: expect.any(Date) },
      select: {
        permissionsId: true,
        resource: true,
        action: true,
      },
    });
    expect(result).toEqual(expectedResult);
  });
});
