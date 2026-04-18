import { Test, TestingModule } from '@nestjs/testing';
import { MenusService } from './menus.service';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from '../user/user.service';

describe('MenusService', () => {
  let service: MenusService;
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
        MenusService,
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

    service = module.get<MenusService>(MenusService);
    prismaService = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyMenus', () => {
    it('should return empty array when user has no permissions', async () => {
      mockUserService.getEffectivePermissions.mockResolvedValue([]);

      const result = await service.getMyMenus(1);

      expect(result).toEqual([]);
    });

    it('should return menu tree when user has permissions', async () => {
      const mockPermissions = [
        { resource: 'dashboard', action: 'read' },
      ];

      mockUserService.getEffectivePermissions.mockResolvedValue(mockPermissions);
      mockPrismaService.menus.findMany.mockResolvedValue([mockMenuRecord]);

      const result = await service.getMyMenus(1);

      expect(result).toBeDefined();
    });

    it('should throw when menuPermissions query fails', async () => {
      const mockPermissions = [{ resource: 'test', action: 'read' }];
      mockUserService.getEffectivePermissions.mockResolvedValue(mockPermissions);
      mockPrismaService.menus.findMany.mockRejectedValue(new Error('DB Error'));

      await expect(service.getMyMenus(1)).rejects.toThrow();
    });
  });
});