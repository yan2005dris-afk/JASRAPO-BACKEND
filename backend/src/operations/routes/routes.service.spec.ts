import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { GetEligibleReadingsUseCase } from './use-cases/get-eligible-readings.use-case';
import { CreateRouteUseCase } from './use-cases/create-route.use-case';
import { FindAllRoutesUseCase } from './use-cases/find-all-routes.use-case';
import { FindOneRouteUseCase } from './use-cases/find-one-route.use-case';
import { UpdateRouteUseCase } from './use-cases/update-route.use-case';
import { DeleteRouteUseCase } from './use-cases/delete-route.use-case';

describe('RoutesService', () => {
  let service: RoutesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        {
          provide: GetEligibleReadingsUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CreateRouteUseCase, useValue: { execute: jest.fn() } },
        { provide: FindAllRoutesUseCase, useValue: { execute: jest.fn() } },
        { provide: FindOneRouteUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateRouteUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteRouteUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
