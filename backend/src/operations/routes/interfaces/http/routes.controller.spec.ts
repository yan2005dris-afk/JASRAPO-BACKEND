import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RoutesController } from './routes.controller';
import { RoutesService } from '../../application/routes.service';
import { ReassignRouteUseCase } from '../../application/use-cases/reassign-route.use-case';

describe('RoutesController', () => {
  let controller: RoutesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutesController],
      providers: [
        {
          provide: RoutesService,
          useValue: {
            getEligibleReadings: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ReassignRouteUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoutesController>(RoutesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
