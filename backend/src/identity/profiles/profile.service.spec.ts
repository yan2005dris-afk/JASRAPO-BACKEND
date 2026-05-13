import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { CreateProfileUseCase } from './use-cases/create-profile.use-case';
import { FindMyProfileUseCase } from './use-cases/find-my-profile.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { UploadAvatarUseCase } from './use-cases/upload-avatar.use-case';
import { ListAvailableAvatarsUseCase } from './use-cases/list-available-avatars.use-case';
import { SelectExistingAvatarUseCase } from './use-cases/select-existing-avatar.use-case';

describe('ProfileService', () => {
  let service: ProfileService;
  let createUseCase: CreateProfileUseCase;
  let findMyProfileUseCase: FindMyProfileUseCase;
  let updateUseCase: UpdateProfileUseCase;
  let uploadAvatarUseCase: UploadAvatarUseCase;
  let listAvatarsUseCase: ListAvailableAvatarsUseCase;
  let selectAvatarUseCase: SelectExistingAvatarUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: CreateProfileUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindMyProfileUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateProfileUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UploadAvatarUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListAvailableAvatarsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SelectExistingAvatarUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    createUseCase = module.get<CreateProfileUseCase>(CreateProfileUseCase);
    findMyProfileUseCase =
      module.get<FindMyProfileUseCase>(FindMyProfileUseCase);
    updateUseCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
    uploadAvatarUseCase = module.get<UploadAvatarUseCase>(UploadAvatarUseCase);
    listAvatarsUseCase = module.get<ListAvailableAvatarsUseCase>(
      ListAvailableAvatarsUseCase,
    );
    selectAvatarUseCase = module.get<SelectExistingAvatarUseCase>(
      SelectExistingAvatarUseCase,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate create to CreateProfileUseCase', async () => {
    const userId = 1;
    const dto = { firstName: 'John', lastName: 'Doe' };
    await service.create(userId, dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(userId, dto);
  });

  it('should delegate findMyProfile to FindMyProfileUseCase', async () => {
    const userId = 1;
    await service.findMyProfile(userId);
    expect(findMyProfileUseCase.execute).toHaveBeenCalledWith(userId);
  });

  it('should delegate update to UpdateProfileUseCase', async () => {
    const userId = 1;
    const dto = { firstName: 'Jane' };
    await service.update(userId, dto);
    expect(updateUseCase.execute).toHaveBeenCalledWith(userId, dto);
  });

  it('should delegate uploadAvatar to UploadAvatarUseCase', async () => {
    const userId = 1;
    const file = { buffer: Buffer.from('') } as any;
    await service.uploadAvatar(userId, file);
    expect(uploadAvatarUseCase.execute).toHaveBeenCalledWith(userId, file);
  });

  it('should delegate listAvailableAvatars to ListAvailableAvatarsUseCase', async () => {
    const userId = 1;
    await service.listAvailableAvatars(userId);
    expect(listAvatarsUseCase.execute).toHaveBeenCalledWith(userId);
  });

  it('should delegate selectExistingAvatar to SelectExistingAvatarUseCase', async () => {
    const userId = 1;
    const key = 'avatar.png';
    await service.selectExistingAvatar(userId, key);
    expect(selectAvatarUseCase.execute).toHaveBeenCalledWith(userId, key);
  });
});
