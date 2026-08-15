import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetUserDetailUseCase } from './use-cases/get-user-detail.use-case';
import { GetUserProfileUseCase } from './use-cases/get-user-profile.use-case';
import { GetActiveUsersUseCase } from './use-cases/get-active-users.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { UpdateUserAvatarUseCase } from './use-cases/update-user-avatar.use-case';
import { SoftDeleteUserUseCase } from './use-cases/soft-delete-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let createUserUseCase: CreateUserUseCase;
  let getUserDetailUseCase: GetUserDetailUseCase;
  let getUserProfileUseCase: GetUserProfileUseCase;
  let getActiveUsersUseCase: GetActiveUsersUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let updateUserAvatarUseCase: UpdateUserAvatarUseCase;
  let softDeleteUserUseCase: SoftDeleteUserUseCase;
  let getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase;

  const mockUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: CreateUserUseCase, useValue: mockUseCase },
        { provide: GetUserDetailUseCase, useValue: mockUseCase },
        { provide: GetUserProfileUseCase, useValue: mockUseCase },
        { provide: GetActiveUsersUseCase, useValue: mockUseCase },
        { provide: UpdateUserUseCase, useValue: mockUseCase },
        { provide: UpdateUserAvatarUseCase, useValue: mockUseCase },
        { provide: SoftDeleteUserUseCase, useValue: mockUseCase },
        { provide: GetEffectivePermissionsUseCase, useValue: mockUseCase },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    getUserDetailUseCase =
      module.get<GetUserDetailUseCase>(GetUserDetailUseCase);
    getUserProfileUseCase = module.get<GetUserProfileUseCase>(
      GetUserProfileUseCase,
    );
    getActiveUsersUseCase = module.get<GetActiveUsersUseCase>(
      GetActiveUsersUseCase,
    );
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    updateUserAvatarUseCase = module.get<UpdateUserAvatarUseCase>(
      UpdateUserAvatarUseCase,
    );
    softDeleteUserUseCase = module.get<SoftDeleteUserUseCase>(
      SoftDeleteUserUseCase,
    );
    getEffectivePermissionsUseCase = module.get<GetEffectivePermissionsUseCase>(
      GetEffectivePermissionsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate user to GetUserDetailUseCase', async () => {
    const criteria = { usuarioId: 1 };
    await service.user(criteria);
    expect(getUserDetailUseCase.execute).toHaveBeenCalledWith(criteria);
  });

  it('should delegate findMe to GetUserProfileUseCase', async () => {
    await service.findMe(1);
    expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(1);
  });

  it('should delegate createUser to CreateUserUseCase', async () => {
    const dto = { email: 'test@test.com' } as any;
    await service.createUser(dto);
    expect(createUserUseCase.execute).toHaveBeenCalledWith(dto, undefined);
  });

  it('should delegate users to GetActiveUsersUseCase', async () => {
    const pagination = { page: 1, limit: 10 };
    await service.users(pagination);
    expect(getActiveUsersUseCase.execute).toHaveBeenCalledWith(pagination);
  });

  it('should delegate updateUser to UpdateUserUseCase', async () => {
    const updateDto = { nombres: 'Test' };
    await service.updateUser(1, updateDto);
    expect(updateUserUseCase.execute).toHaveBeenCalledWith(
      1,
      updateDto,
      undefined,
    );
  });

  it('should delegate updateAvatar to UpdateUserAvatarUseCase', async () => {
    const file = {} as any;
    await service.updateAvatar(1, file);
    expect(updateUserAvatarUseCase.execute).toHaveBeenCalledWith(1, file);
  });

  it('should delegate softDeleteUser to SoftDeleteUserUseCase', async () => {
    await service.softDeleteUser(1);
    expect(softDeleteUserUseCase.execute).toHaveBeenCalledWith(1);
  });

  it('should delegate getEffectivePermissions to GetEffectivePermissionsUseCase', async () => {
    (getEffectivePermissionsUseCase.execute as jest.Mock).mockResolvedValue([
      { recurso: 'users', accion: 'read' },
    ]);
    const result = await service.getEffectivePermissions(1);
    expect(result).toEqual({
      usuarioId: 1,
      permisos: [{ recurso: 'users', accion: 'read' }],
    });
  });
});
