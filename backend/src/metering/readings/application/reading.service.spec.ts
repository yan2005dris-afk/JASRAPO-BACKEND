import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReadingService } from './reading.service';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';

describe('ReadingService', () => {
  let service: ReadingService;
  let findAllUseCase: FindAllReadingsUseCase;
  let findOneUseCase: FindOneReadingUseCase;
  let updateUseCase: UpdateReadingUseCase;
  let removeUseCase: RemoveReadingUseCase;

  const reading = { lecturaId: 1n, lecturaActual: 150 } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingService,
        { provide: FindAllReadingsUseCase, useValue: { execute: jest.fn() } },
        { provide: FindOneReadingUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateReadingUseCase, useValue: { execute: jest.fn() } },
        { provide: RemoveReadingUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();
    service = module.get(ReadingService);
    findAllUseCase = module.get(FindAllReadingsUseCase);
    findOneUseCase = module.get(FindOneReadingUseCase);
    updateUseCase = module.get(UpdateReadingUseCase);
    removeUseCase = module.get(RemoveReadingUseCase);
  });

  it('should be defined', () => expect(service).toBeDefined());

  it('delegates findAll', async () => {
    const result = { data: [reading], meta: { total: 1 } } as any;
    findAllUseCase.execute = jest.fn().mockResolvedValue(result);
    await expect(service.findAll(1, 10, { medidorId: 1n })).resolves.toBe(
      result,
    );
    expect(findAllUseCase.execute).toHaveBeenCalledWith(1, 10, {
      medidorId: 1n,
    });
  });

  it('delegates findOne', async () => {
    findOneUseCase.execute = jest.fn().mockResolvedValue(reading);
    await expect(service.findOne(1n)).resolves.toBe(reading);
    expect(findOneUseCase.execute).toHaveBeenCalledWith(1n);
  });

  it('delegates update without standalone creation or photo handling', async () => {
    updateUseCase.execute = jest.fn().mockResolvedValue(reading);
    const dto = { lecturaActual: 200 };
    await expect(service.update(1n, dto)).resolves.toBe(reading);
    expect(updateUseCase.execute).toHaveBeenCalledWith(1n, dto, undefined);
  });

  it('delegates delete', async () => {
    const result = { message: 'deleted' };
    removeUseCase.execute = jest.fn().mockResolvedValue(result);
    await expect(service.delete(1n)).resolves.toBe(result);
    expect(removeUseCase.execute).toHaveBeenCalledWith(1n);
  });
});
