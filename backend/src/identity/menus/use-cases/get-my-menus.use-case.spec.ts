import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UserService } from '../../users/user.service';
import { GetMyMenusUseCase } from './get-my-menus.use-case';

describe('GetMyMenusUseCase', () => {
  let useCase: GetMyMenusUseCase;
  let prismaService: PrismaService;
  let userService: UserService;

  const mockMenuRecord = {
    menusId: 1,
    menusParentId: null,
    name: 'Dashboard',
    route: '/dashboard',
    icon: 'dashboard',
    active: true,
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
    mockUserService.getEffectivePermissions.mockResolvedValue([]);

    const result = await useCase.execute(1);

    expect(result).toEqual([]);
    expect(userService.getEffectivePermissions).toHaveBeenCalledWith(1);
  });

  it('should build menu tree when user has permissions', async () => {
    const mockPermissions = [{ resource: 'dashboard', action: 'read' }];
    mockUserService.getEffectivePermissions.mockResolvedValue(mockPermissions);
    
    // First findMany for direct menus
    mockPrismaService.menus.findMany.mockResolvedValueOnce([mockMenuRecord]);

    const result = await useCase.execute(1);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Dashboard');
    expect(prismaService.menus.findMany).toHaveBeenCalled();
  });

  it('should include parent menus recursively', async () => {
    const mockPermissions = [{ resource: 'child', action: 'read' }];
    const childMenu = {
      menusId: 2,
      menusParentId: 1,
      name: 'Child',
      route: '/child',
      active: true,
    };
    const parentMenu = {
      menusId: 1,
      menusParentId: null,
      name: 'Parent',
      route: '/parent',
      active: true,
    };

    mockUserService.getEffectivePermissions.mockResolvedValue(mockPermissions);
    
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
