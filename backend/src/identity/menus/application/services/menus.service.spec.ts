import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MenusService } from './menus.service';
import { GetMyMenusUseCase } from '../use-cases/get-my-menus.use-case';

describe('MenusService', () => {
  let service: MenusService;
  let getMyMenusUseCase: GetMyMenusUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenusService,
        {
          provide: GetMyMenusUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MenusService>(MenusService);
    getMyMenusUseCase = module.get<GetMyMenusUseCase>(GetMyMenusUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate getMyMenus to GetMyMenusUseCase', async () => {
    const userId = 1;
    await service.getMyMenus(userId);
    expect(getMyMenusUseCase.execute).toHaveBeenCalledWith(userId);
  });
});
