import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from 'src/database/prisma.service';
import { MinioService } from '../storage/minio.service';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: {
            profiles: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: MinioService,
          useValue: {
            uploadFile: jest.fn(),
            listFiles: jest.fn(),
            getPresignedUrl: jest.fn(),
            fileExists: jest.fn(),
            getFileMetadata: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
