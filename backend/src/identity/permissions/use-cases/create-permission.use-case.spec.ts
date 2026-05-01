import { Test, TestingModule } from '@nestjs/testing';
import { CreatePermissionUseCase } from './create-permission.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('CreatePermissionUseCase', () => {
  let useCase: CreatePermissionUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    permissions: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePermissionUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<CreatePermissionUseCase>(CreatePermissionUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a permission', async () => {
    const dto = { resource: 'Users', action: 'Read' };
    mockPrisma.permissions.create.mockResolvedValue({ permissionsId: 1, ...dto });

    const result = await useCase.execute(dto);

    expect(result).toEqual({ permissionsId: 1, ...dto });
    expect(prisma.permissions.create).toHaveBeenCalledWith({ data: dto });
  });
});
