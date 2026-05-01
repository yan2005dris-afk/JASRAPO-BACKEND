import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { LecturaService } from './lectura.service';
import { CreateReadingUseCase } from './use-cases/create-reading.use-case';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';
import { LecturaEntity } from './entities/lectura.entity';

describe('LecturaService', () => {
  let service: LecturaService;
  let createUseCase: CreateReadingUseCase;
  let findAllUseCase: FindAllReadingsUseCase;
  let findOneUseCase: FindOneReadingUseCase;
  let updateUseCase: UpdateReadingUseCase;
  let removeUseCase: RemoveReadingUseCase;

  const mockLectura = new LecturaEntity({
    lecturaId: BigInt(1),
    fecha: new Date(),
    lecturaAnterior: 100,
    lecturaActual: 150,
    consumoCalculado: 50,
    contratoId: BigInt(1),
  } as any);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturaService,
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

    service = module.get<LecturaService>(LecturaService);
    createUseCase = module.get<CreateReadingUseCase>(CreateReadingUseCase);
    findAllUseCase = module.get<FindAllReadingsUseCase>(FindAllReadingsUseCase);
    findOneUseCase = module.get<FindOneReadingUseCase>(FindOneReadingUseCase);
    updateUseCase = module.get<UpdateReadingUseCase>(UpdateReadingUseCase);
    removeUseCase = module.get<RemoveReadingUseCase>(RemoveReadingUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('crearLectura should delegate to CreateReadingUseCase', async () => {
    const dto = { contratoId: '1' } as any;
    jest.spyOn(createUseCase, 'execute').mockResolvedValue(mockLectura);
    const result = await service.crearLectura(dto);
    expect(result).toBe(mockLectura);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('buscarLecturas should delegate to FindAllReadingsUseCase', async () => {
    const params = { skip: 0 };
    jest.spyOn(findAllUseCase, 'execute').mockResolvedValue([mockLectura]);
    const result = await service.buscarLecturas(params);
    expect(result).toEqual([mockLectura]);
    expect(findAllUseCase.execute).toHaveBeenCalledWith(params);
  });

  it('buscarLectura should delegate to FindOneReadingUseCase', async () => {
    const id = BigInt(1);
    jest.spyOn(findOneUseCase, 'execute').mockResolvedValue(mockLectura);
    const result = await service.buscarLectura(id);
    expect(result).toBe(mockLectura);
    expect(findOneUseCase.execute).toHaveBeenCalledWith(id);
  });

  it('actualizarLectura should delegate to UpdateReadingUseCase', async () => {
    const id = BigInt(1);
    const dto = { lecturaActual: 200 };
    jest.spyOn(updateUseCase, 'execute').mockResolvedValue(mockLectura);
    const result = await service.actualizarLectura(id, dto);
    expect(result).toBe(mockLectura);
    expect(updateUseCase.execute).toHaveBeenCalledWith(id, dto);
  });

  it('eliminarLectura should delegate to RemoveReadingUseCase', async () => {
    const id = BigInt(1);
    const response = { message: 'deleted' };
    jest.spyOn(removeUseCase, 'execute').mockResolvedValue(response);
    const result = await service.eliminarLectura(id);
    expect(result).toBe(response);
    expect(removeUseCase.execute).toHaveBeenCalledWith(id);
  });
});
