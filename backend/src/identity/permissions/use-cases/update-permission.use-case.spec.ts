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
            permisos: {
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
    const expectedResult = { permisoId: id, recurso: dto.resource, accion: dto.action };
    (prismaService.permisos.update as jest.fn).mockResolvedValue(
      expectedResult,
    );

    const result = await useCase.execute(id, dto);

    expect(prismaService.permisos.update).toHaveBeenCalledWith({
      where: { permisoId: id },
      data: {
        recurso: dto.resource,
        accion: dto.action,
      },
      select: {
        permisoId: true,
        recurso: true,
        accion: true,
      },
    });
    expect(result).toEqual(expectedResult);
  });
});
