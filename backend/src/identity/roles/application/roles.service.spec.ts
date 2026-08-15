import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { CreateRoleUseCase } from './use-cases/create-role.use-case';
import { FindAllRolesUseCase } from './use-cases/find-all-roles.use-case';
import { FindOneRoleUseCase } from './use-cases/find-one-role.use-case';
import { UpdateRoleUseCase } from './use-cases/update-role.use-case';

describe('RolesService', () => {
  let service: RolesService;
  let createUseCase: CreateRoleUseCase;
  let findAllRolesUseCase: FindAllRolesUseCase;
  let findOneRoleUseCase: FindOneRoleUseCase;
  let updateRoleUseCase: UpdateRoleUseCase;

  const mockCreateUseCase = { execute: jest.fn() };
  const mockFindAllUseCase = { execute: jest.fn() };
  const mockFindOneUseCase = { execute: jest.fn() };
  const mockUpdateUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: CreateRoleUseCase, useValue: mockCreateUseCase },
        { provide: FindAllRolesUseCase, useValue: mockFindAllUseCase },
        { provide: FindOneRoleUseCase, useValue: mockFindOneUseCase },
        { provide: UpdateRoleUseCase, useValue: mockUpdateUseCase },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    createUseCase = module.get<CreateRoleUseCase>(CreateRoleUseCase);
    findAllRolesUseCase = module.get<FindAllRolesUseCase>(FindAllRolesUseCase);
    findOneRoleUseCase = module.get<FindOneRoleUseCase>(FindOneRoleUseCase);
    updateRoleUseCase = module.get<UpdateRoleUseCase>(UpdateRoleUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate create to CreateRoleUseCase', async () => {
    const dto = { nombre: 'Role' } as any;
    await service.create(dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll to FindAllRolesUseCase', async () => {
    await service.findAll(1, 10);
    expect(findAllRolesUseCase.execute).toHaveBeenCalledWith(1, 10);
  });

  it('should delegate findOne to FindOneRoleUseCase', async () => {
    await service.findOne(1);
    expect(findOneRoleUseCase.execute).toHaveBeenCalledWith(1);
  });

  it('should delegate update to UpdateRoleUseCase', async () => {
    const dto = { nombre: 'Updated' } as any;
    await service.update(1, dto);
    expect(updateRoleUseCase.execute).toHaveBeenCalledWith(1, dto);
  });
});
