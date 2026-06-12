import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from '../../application/roles.service';

describe('RolesController', () => {
  let controller: RolesController;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllRoles should call service.findAll with pagination', async () => {
    const paginationDto = { page: 2, limit: 5 };
    await controller.findAllRoles(paginationDto);
    expect(mockRolesService.findAll).toHaveBeenCalledWith(2, 5);
  });

  it('findAllRoles should use defaults when no pagination provided', async () => {
    await controller.findAllRoles({ page: 1, limit: 10 });
    expect(mockRolesService.findAll).toHaveBeenCalledWith(1, 10);
  });
});
