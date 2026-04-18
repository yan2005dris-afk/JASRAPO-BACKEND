import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

describe('MenusController', () => {
  let controller: MenusController;
  let menusService: { getMyMenus: jest.Mock };

  beforeEach(async () => {
    menusService = {
      getMyMenus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenusController],
      providers: [
        {
          provide: MenusService,
          useValue: menusService,
        },
      ],
    }).compile();

    controller = module.get<MenusController>(MenusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyMenus', () => {
    it('should return menu array for authenticated user', async () => {
      const mockMenus = [
        {
          id: 1,
          name: 'Dashboard',
          route: '/dashboard',
          icon: 'dashboard',
          children: [],
        },
        {
          id: 2,
          name: 'Usuarios',
          route: '/users',
          icon: 'people',
          children: [
            { id: 3, name: 'Listar Usuarios', route: '/users/list', icon: null },
          ],
        },
      ];

      menusService.getMyMenus.mockResolvedValue(mockMenus);

      const mockRequest = {
        user: { sub: 'user-123' },
      } as any;

      const result = await controller.getMyMenus(mockRequest);

      expect(menusService.getMyMenus).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockMenus);
    });
  });
});