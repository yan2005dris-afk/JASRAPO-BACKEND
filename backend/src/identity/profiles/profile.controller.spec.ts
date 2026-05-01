import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { MinioService } from '../../infrastructure/storage/minio.service';

describe('ProfileController', () => {
  let controller: ProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: {
            create: jest.fn(),
            findMyProfile: jest.fn(),
            update: jest.fn(),
            uploadAvatar: jest.fn(),
            listAvailableAvatars: jest.fn(),
            selectExistingAvatar: jest.fn(),
            removeAvatar: jest.fn(),
          },
        },
        {
          provide: MinioService,
          useValue: {
            getPresignedUrl: jest.fn(),
            getFileStream: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
