import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from 'src/database/prisma.service';

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            $queryRaw: jest.fn(),
            $executeRawUnsafe: jest.fn(),
            roles: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            rolesHeredados: {
              findMany: jest.fn(),
            },
            rolPermissions: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
