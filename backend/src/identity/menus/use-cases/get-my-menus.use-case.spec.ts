import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UserService } from '../../users/user.service';
import { GetMyMenusUseCase } from './get-my-menus.use-case';

describe('GetMyMenusUseCase', () => {
  let useCase: GetMyMenusUseCase;
  let prismaService: PrismaService;
  let userService: UserService;

  const mockMenuRecord = {
    menuId: 1,
    menuPadreId: null,
    nombre: 'Dashboard',
    ruta: '/dashboard',
    icono: 'dashboard',
    activo: true,
    createdAt: new Date(),
    deletedAt: null,
  };

  const mockUserService = {
    getEffectivePermissions: jest.fn(),
  };

  const mockPrismaService = {
    menus: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyMenusUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    useCase = module.get<GetMyMenusUseCase>(GetMyMenusUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return empty array when user has no permissions', async () => {
    mockUserService.getEffectivePermissions.mockResolvedValue({
      usuarioId: 1,
      permisos: [],
    });

    const result = await useCase.execute(1);

    expect(result).toEqual([]);
    expect(userService.getEffectivePermissions).toHaveBeenCalledWith(1);
  });

  it('should build menu tree when user has permissions', async () => {
    const mockPermissions = [{ recurso: 'dashboard', accion: 'read' }];
    mockUserService.getEffectivePermissions.mockResolvedValue({
      usuarioId: 1,
      permisos: mockPermissions,
    });

    // First findMany for direct menus
    mockPrismaService.menus.findMany.mockResolvedValueOnce([mockMenuRecord]);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Dashboard');
    expect(prismaService.menus.findMany).toHaveBeenCalled();
  });

  it('should include parent menus recursively', async () => {
    const mockPermissions = [{ recurso: 'child', accion: 'read' }];
    const childMenu = {
      menuId: 2,
      menuPadreId: 1,
      nombre: 'Child',
      ruta: '/child',
      activo: true,
    };
    const parentMenu = {
      menuId: 1,
      menuPadreId: null,
      nombre: 'Parent',
      ruta: '/parent',
      activo: true,
    };

    mockUserService.getEffectivePermissions.mockResolvedValue({
      usuarioId: 1,
      permisos: mockPermissions,
    });

    // First call: find child menu
    mockPrismaService.menus.findMany.mockResolvedValueOnce([childMenu]);
    // Second call (while loop): find parent menu
    mockPrismaService.menus.findMany.mockResolvedValueOnce([parentMenu]);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Parent');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].name).toBe('Child');
  });
});
