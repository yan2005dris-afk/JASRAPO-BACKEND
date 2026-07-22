import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReadingService } from './reading.service';
import { CreateReadingUseCase } from './use-cases/create-reading.use-case';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { ImageProcessorUtil } from 'src/infrastructure/common/utils/image-processor.util';
import { LecturaEntity } from '../domain/entities/lectura.entity';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

jest.mock('src/infrastructure/common/utils/image-processor.util', () => ({
  ImageProcessorUtil: {
    toWebP: jest.fn().mockResolvedValue(Buffer.from('processed-image-webp')),
  },
}));

const mockFile = {
  buffer: Buffer.from('fake-image-data'),
  mimetype: 'image/jpeg',
  size: 1024,
  originalname: 'evidencia.jpg',
  fieldname: 'file',
  encoding: '7bit',
  destination: '',
  filename: '',
  path: '',
  stream: null as unknown,
} as Express.Multer.File;

describe('ReadingService', () => {
  let service: ReadingService;
  let storageService: StorageService;
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

  const mockLecturaWithFoto = {
    ...mockLectura,
    fotoUrl: 'readings/old-key.webp',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
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
        {
          provide: StorageService,
          useValue: {
            upload: jest.fn().mockResolvedValue({ key: 'readings/uuid.webp' }),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ReadingService>(ReadingService);
    storageService = module.get<StorageService>(StorageService);
    createUseCase = module.get<CreateReadingUseCase>(CreateReadingUseCase);
    findAllUseCase = module.get<FindAllReadingsUseCase>(FindAllReadingsUseCase);
    findOneUseCase = module.get<FindOneReadingUseCase>(FindOneReadingUseCase);
    updateUseCase = module.get<UpdateReadingUseCase>(UpdateReadingUseCase);
    removeUseCase = module.get<RemoveReadingUseCase>(RemoveReadingUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('create with file should upload and pass fotoUrl to useCase', async () => {
    const dto = { medidorId: '1', fotoUrl: undefined } as any;
    jest.spyOn(createUseCase, 'execute').mockResolvedValue(mockLectura as any);

    const result = await service.create(dto, mockFile);

    expect(result).toBe(mockLectura);
    expect(ImageProcessorUtil.toWebP).toHaveBeenCalledWith(mockFile.buffer, {
      width: 1024,
      quality: 80,
    });
    expect(storageService.upload).toHaveBeenCalledWith(
      'readings',
      expect.stringMatching(/^readings\/.+\.webp$/),
      Buffer.from('processed-image-webp'),
      { contentType: 'image/webp' },
    );
    expect(createUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        fotoUrl: expect.stringMatching(/^readings\/.+\.webp$/),
      }),
    );
  });

  it('create with file should rollback upload on useCase failure', async () => {
    const dto = { medidorId: '1' } as any;
    jest
      .spyOn(createUseCase, 'execute')
      .mockRejectedValue(new Error('DB error'));
    (storageService.upload as jest.Mock).mockResolvedValue(undefined);

    await expect(service.create(dto, mockFile)).rejects.toThrow('DB error');

    expect(storageService.delete).toHaveBeenCalledWith(
      'readings',
      expect.stringMatching(/^readings\/.+\.webp$/),
    );
  });

  it('create without file should pass dto as-is', async () => {
    const dto = {
      medidorId: '1',
      fotoUrl: 'readings/existing-key.webp',
    } as any;
    jest.spyOn(createUseCase, 'execute').mockResolvedValue(mockLectura as any);

    const result = await service.create(dto);

    expect(result).toBe(mockLectura);
    expect(storageService.upload).not.toHaveBeenCalled();
    expect(createUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ fotoUrl: 'readings/existing-key.webp' }),
    );
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
    jest.spyOn(findOneUseCase, 'execute').mockResolvedValue(mockLectura as any);
    jest.spyOn(updateUseCase, 'execute').mockResolvedValue(mockLectura as any);
    const result = await service.update(id, dto);
    expect(result).toBe(mockLectura);
    expect(updateUseCase.execute).toHaveBeenCalledWith(id, dto, undefined);
  });

  it('update with file should upload, set fotoUrl, and delete old', async () => {
    const id = BigInt(1);
    const dto = { lecturaActual: 200 } as any;
    jest
      .spyOn(findOneUseCase, 'execute')
      .mockResolvedValue(mockLecturaWithFoto as any);
    jest.spyOn(updateUseCase, 'execute').mockResolvedValue(mockLectura as any);

    const result = await service.update(id, dto, undefined, mockFile);

    expect(result).toBe(mockLectura);
    expect(ImageProcessorUtil.toWebP).toHaveBeenCalled();
    expect(storageService.upload).toHaveBeenCalledWith(
      'readings',
      expect.stringMatching(/^readings\/.+\.webp$/),
      expect.any(Buffer),
      expect.any(Object),
    );
    expect(updateUseCase.execute).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        lecturaActual: 200,
        fotoUrl: expect.stringMatching(/^readings\/.+\.webp$/),
      }),
      undefined,
    );
    expect(storageService.delete).toHaveBeenCalledWith(
      'readings',
      'readings/old-key.webp',
    );
  });

  it('update with file should rollback upload on useCase failure', async () => {
    const id = BigInt(1);
    const dto = { lecturaActual: 200 } as any;
    jest
      .spyOn(findOneUseCase, 'execute')
      .mockResolvedValue(mockLecturaWithFoto as any);
    jest
      .spyOn(updateUseCase, 'execute')
      .mockRejectedValue(new Error('DB error'));

    await expect(service.update(id, dto, undefined, mockFile)).rejects.toThrow(
      'DB error',
    );

    // Should delete the NEWLY uploaded file (rollback)
    const deleteCallArgs = (storageService.delete as jest.Mock).mock.calls[0];
    expect(deleteCallArgs[0]).toBe('readings');
    expect(deleteCallArgs[1]).toMatch(/^readings\/.+\.webp$/);
  });

  it('update without file should not touch storage', async () => {
    const id = BigInt(1);
    const dto = { lecturaActual: 200 } as any;
    jest.spyOn(findOneUseCase, 'execute').mockResolvedValue(mockLectura as any);
    jest.spyOn(updateUseCase, 'execute').mockResolvedValue(mockLectura as any);

    await service.update(id, dto);

    expect(storageService.upload).not.toHaveBeenCalled();
    expect(storageService.delete).not.toHaveBeenCalled();
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
