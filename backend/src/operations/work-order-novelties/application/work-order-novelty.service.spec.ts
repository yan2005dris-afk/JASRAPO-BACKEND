import { Test } from '@nestjs/testing';
import { WorkOrderNoveltyService } from './work-order-novelty.service';
import { CreateWorkOrderNoveltyUseCase } from './use-cases/create-work-order-novelty.use-case';
import { FindWorkOrderNoveltyUseCase } from './use-cases/find-work-order-novelty.use-case';
import { FindWorkOrderNoveltiesUseCase } from './use-cases/find-work-order-novelties.use-case';
import { UpdateWorkOrderNoveltyUseCase } from './use-cases/update-work-order-novelty.use-case';
import { SoftDeleteWorkOrderNoveltyUseCase } from './use-cases/soft-delete-work-order-novelty.use-case';

describe('WorkOrderNoveltyService (facade)', () => {
  let service: WorkOrderNoveltyService;
  let useCases: Record<string, jest.Mock>;

  beforeEach(async () => {
    useCases = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        WorkOrderNoveltyService,
        {
          provide: CreateWorkOrderNoveltyUseCase,
          useValue: { execute: useCases.create },
        },
        {
          provide: FindWorkOrderNoveltyUseCase,
          useValue: { execute: useCases.findById },
        },
        {
          provide: FindWorkOrderNoveltiesUseCase,
          useValue: { execute: useCases.findAll },
        },
        {
          provide: UpdateWorkOrderNoveltyUseCase,
          useValue: { execute: useCases.update },
        },
        {
          provide: SoftDeleteWorkOrderNoveltyUseCase,
          useValue: { execute: useCases.softDelete },
        },
      ],
    }).compile();
    service = module.get<WorkOrderNoveltyService>(WorkOrderNoveltyService);
  });

  it('delegates create to CreateWorkOrderNoveltyUseCase', async () => {
    const dto = { ordenTrabajoId: '10', tipo: 'FUGA' as any };
    await service.create(dto);
    expect(useCases.create).toHaveBeenCalledWith(dto, undefined);
  });

  it('delegates findById to FindWorkOrderNoveltyUseCase', async () => {
    await service.findById(1n);
    expect(useCases.findById).toHaveBeenCalledWith(1n);
  });

  it('delegates findAll to FindWorkOrderNoveltiesUseCase', async () => {
    const filters = { page: 1, limit: 10 };
    await service.findAll(filters);
    expect(useCases.findAll).toHaveBeenCalledWith(filters);
  });

  it('delegates update to UpdateWorkOrderNoveltyUseCase', async () => {
    const dto = { observacion: 'fixed' };
    await service.update(1n, dto);
    expect(useCases.update).toHaveBeenCalledWith(1n, dto, undefined, undefined);
  });

  it('delegates softDelete to SoftDeleteWorkOrderNoveltyUseCase', async () => {
    await service.softDelete(1n, 42);
    expect(useCases.softDelete).toHaveBeenCalledWith(1n, 42);
  });
});
