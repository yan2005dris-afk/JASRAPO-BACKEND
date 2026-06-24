import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReadingService } from './reading.service';
import { CreateReadingUseCase } from './use-cases/create-reading.use-case';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';
import { LecturaEntity } from '../domain/entities/lectura.entity';

describe('ReadingService', () => {
  let service: ReadingService;
  let createUseCase: CreateReadingUseCase;
  let findAllUseCase: FindAllReadingsUseCase;
  let findOneUseCase: FindOneReadingUseCase;
  let updateUseCase: UpdateReadingUseCase;
  let removeUseCase: RemoveReadingUseCase;

  const mockLectura = {
    lecturaId: BigInt(1),
    fecha: new Date(),
    lecturaAnterior: 100,
    lecturaActual: 150,
    consumoCalculado: 50,
    medidorId: BigInt(1),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingService,
        {
          provide: CreateReadingUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindAllReadingsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindOneReadingUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateReadingUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RemoveReadingUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ReadingService>(ReadingService);
    createUseCase = module.get<CreateReadingUseCase>(CreateReadingUseCase);
    findAllUseCase = module.get<FindAllReadingsUseCase>(FindAllReadingsUseCase);
    findOneUseCase = module.get<FindOneReadingUseCase>(FindOneReadingUseCase);
    updateUseCase = module.get<UpdateReadingUseCase>(UpdateReadingUseCase);
    removeUseCase = module.get<RemoveReadingUseCase>(RemoveReadingUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should delegate to CreateReadingUseCase', async () => {
    const dto = { medidorId: '1' } as any;
    jest.spyOn(createUseCase, 'execute').mockResolvedValue(mockLectura as any);
    const result = await service.create(dto);
    expect(result).toBe(mockLectura);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('findAll should delegate to FindAllReadingsUseCase', async () => {
    const where = { medidorId: BigInt(1) };
    const paginatedResult = {
      data: [mockLectura],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        ultimaPagina: 1,
        paginaActual: 1,
        porPagina: 10,
        anterior: null,
        siguiente: null,
      },
    };
    jest
      .spyOn(findAllUseCase, 'execute')
      .mockResolvedValue(paginatedResult as any);
    const result = await service.findAll(1, 10, where);
    expect(result).toEqual(paginatedResult);
    expect(findAllUseCase.execute).toHaveBeenCalledWith(1, 10, where);
  });

  it('findOne should delegate to FindOneReadingUseCase', async () => {
    const id = BigInt(1);
    jest.spyOn(findOneUseCase, 'execute').mockResolvedValue(mockLectura as any);
    const result = await service.findOne(id);
    expect(result).toBe(mockLectura);
    expect(findOneUseCase.execute).toHaveBeenCalledWith(id);
  });

  it('update should delegate to UpdateReadingUseCase', async () => {
    const id = BigInt(1);
    const dto = { lecturaActual: 200 };
    jest.spyOn(updateUseCase, 'execute').mockResolvedValue(mockLectura as any);
    const result = await service.update(id, dto);
    expect(result).toBe(mockLectura);
    expect(updateUseCase.execute).toHaveBeenCalledWith(id, dto, undefined);
  });

  it('delete should delegate to RemoveReadingUseCase', async () => {
    const id = BigInt(1);
    const response = { message: 'deleted' };
    jest.spyOn(removeUseCase, 'execute').mockResolvedValue(response);
    const result = await service.delete(id);
    expect(result).toBe(response);
    expect(removeUseCase.execute).toHaveBeenCalledWith(id);
  });
});
