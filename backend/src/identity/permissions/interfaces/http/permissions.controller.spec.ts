import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from '../../application/permissions.service';

describe('PermissionsController', () => {
  let controller: PermissionsController;

  const mockPermissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllPermissions should call service.findAll with pagination', async () => {
    const paginationDto = { page: 2, limit: 5 };
    await controller.findAllPermissions(paginationDto);
    expect(mockPermissionsService.findAll).toHaveBeenCalledWith(2, 5);
  });

  it('findAllPermissions should use defaults when no pagination provided', async () => {
    await controller.findAllPermissions({ page: 1, limit: 10 });
    expect(mockPermissionsService.findAll).toHaveBeenCalledWith(1, 10);
  });
});
