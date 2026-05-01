import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdatePermissionUseCase } from './update-permission.use-case';

describe('UpdatePermissionUseCase', () => {
  let useCase: UpdatePermissionUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePermissionUseCase,
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

    useCase = module.get<UpdatePermissionUseCase>(UpdatePermissionUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a permission', async () => {
    const id = 1;
    const dto = { resource: 'test', action: 'test' };
    const expectedResult = { permissionsId: id, ...dto };
    (prismaService.permissions.update as jest.fn).mockResolvedValue(
      expectedResult,
    );

    const result = await useCase.execute(id, dto);

    expect(prismaService.permissions.update).toHaveBeenCalledWith({
      where: { permissionsId: id },
      data: {
        resource: dto.resource,
        action: dto.action,
      },
      select: {
        permissionsId: true,
        resource: true,
        action: true,
      },
    });
    expect(result).toEqual(expectedResult);
  });
});
