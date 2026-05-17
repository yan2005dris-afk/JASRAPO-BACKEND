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
    nombre: 'Suministro',
    ruta: '/suministro',
    icono: 'water_drop',
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
    const mockPermissions = [{ recurso: 'clientes', accion: 'read' }];
    mockUserService.getEffectivePermissions.mockResolvedValue({
      usuarioId: 1,
      permisos: mockPermissions,
    });

    mockPrismaService.menus.findMany.mockResolvedValueOnce([mockMenuRecord]);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Suministro');
    expect(prismaService.menus.findMany).toHaveBeenCalled();
  });

  it('should include parent menus recursively', async () => {
    const mockPermissions = [{ recurso: 'clientes', accion: 'read' }];
    const childMenu = {
      menuId: 2,
      menuPadreId: 1,
      nombre: 'Clientes',
      ruta: '/suministro/clientes',
      icono: 'group',
      activo: true,
      createdAt: new Date(),
      deletedAt: null,
    };
    const parentMenu = {
      menuId: 1,
      menuPadreId: null,
      nombre: 'Suministro',
      ruta: '/suministro',
      icono: 'water_drop',
      activo: true,
      createdAt: new Date(),
      deletedAt: null,
    };

    mockUserService.getEffectivePermissions.mockResolvedValue({
      usuarioId: 1,
      permisos: mockPermissions,
    });

    mockPrismaService.menus.findMany.mockResolvedValueOnce([childMenu]);
    mockPrismaService.menus.findMany.mockResolvedValueOnce([parentMenu]);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Suministro');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].name).toBe('Clientes');
  });
});
