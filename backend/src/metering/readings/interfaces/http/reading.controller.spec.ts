import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ReadingController } from './reading.controller';
import { ReadingService } from '../../application/reading.service';
import { LecturaEntity } from '../../domain/entities/lectura.entity';

describe('ReadingController', () => {
  let controller: ReadingController;
  let service: ReadingService;

  const mockLecturaData = {
    lecturaId: BigInt(1),
    fecha: new Date('2024-01-15'),
    lecturaAnterior: 100,
    lecturaActual: 150,
    consumoCalculado: 50,
    contratoId: BigInt(1),
    createdAt: new Date(),
    descripcionAnomalia: null,
    fechaValidacion: null,
    medidorId: BigInt(1),
    periodoId: 1,
    estado: 'VALIDADA',
    deletedAt: null,
  };

  const mockReadingService = {
    create: jest.fn(() => Promise.resolve(mockLecturaData)),
    findAll: jest.fn(() => Promise.resolve([mockLecturaData])),
    findOne: jest.fn(() => Promise.resolve(mockLecturaData)),
    update: jest.fn(() => Promise.resolve(mockLecturaData)),
    delete: jest.fn(() => Promise.resolve({ message: 'deleted' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingController],
      providers: [{ provide: ReadingService, useValue: mockReadingService }],
    }).compile();

    controller = module.get<ReadingController>(ReadingController);
    service = module.get<ReadingService>(ReadingService);
  });

  describe('create', () => {
    it('should create a reading', async () => {
      const createDto = {
        fecha: '2024-01-15',
        lecturaAnterior: 100,
        lecturaActual: 150,
        contratoId: '1',
        periodo: '1',
      };
      jest.spyOn(service, 'create').mockResolvedValue(mockLecturaData as any);
      const result = await controller.create(createDto as any);

      expect(service.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all readings', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue([mockLecturaData as any]);
      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockLecturaData]);
    });
  });

  describe('findOne', () => {
    it('should return a reading by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockLecturaData as any);
      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockLecturaData);
    });
  });

  describe('update', () => {
    it('should update a reading', async () => {
      const updateDto = { lecturaActual: 200 };
      jest.spyOn(service, 'update').mockResolvedValue(mockLecturaData as any);
      const result = await controller.actualizarLectura('1', updateDto);

      expect(service.update).toHaveBeenCalledWith(BigInt(1), updateDto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a reading', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue({ message: 'deleted' });
      const result = await controller.eliminarLectura('1');

      expect(service.delete).toHaveBeenCalledWith(BigInt(1));
      expect(result).toBeDefined();
    });
  });
});
