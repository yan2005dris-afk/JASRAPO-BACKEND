import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MeterController } from './meter.controller';
import { MeterService } from '../../application/meter.service';

describe('MeterController', () => {
  let controller: MeterController;
  let service: MeterService;

  const mockMedidor = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    modelo: 'DIGITAL_2000',
    marca: 'Itron',
    estado: 'BODEGA',
    deletedAt: null,
  };

  const expectedMappedMedidor = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    modelo: 'DIGITAL_2000',
    marca: 'Itron',
    estado: 'BODEGA',
    fechaInstalacion: null,
    fechaBaja: null,
    motivo: undefined,
    latitud: null,
    longitud: null,
  };

  const mockMeterService = {
    create: jest.fn(() => Promise.resolve(mockMedidor)),
    findAll: jest.fn(() => Promise.resolve([mockMedidor])),
    findOne: jest.fn(() => Promise.resolve(mockMedidor)),
    update: jest.fn(() => Promise.resolve(mockMedidor)),
    remove: jest.fn(() => Promise.resolve(undefined)),
    install: jest.fn(() => Promise.resolve(mockMedidor)),
    reportDefect: jest.fn(() => Promise.resolve(mockMedidor)),
    decommission: jest.fn(() => Promise.resolve(mockMedidor)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeterController],
      providers: [{ provide: MeterService, useValue: mockMeterService }],
    }).compile();

    controller = module.get<MeterController>(MeterController);
    service = module.get<MeterService>(MeterService);
  });

  describe('create', () => {
    it('should create a meter', async () => {
      const createDto = {
        serie: 'MED-001',
        modelo: 'DIGITAL_2000',
        marca: 'Itron',
      };
      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedMappedMedidor);
    });
  });

  describe('findAll', () => {
    it('should return all meters without pagination', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual([expectedMappedMedidor]);
    });

    it('should apply pagination when skip and take provided', async () => {
      const result = await controller.findAll('10', '5');

      expect(service.findAll).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
      });
      expect(result).toEqual([expectedMappedMedidor]);
    });
  });

  describe('findOne', () => {
    it('should return a meter by id', async () => {
      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(expectedMappedMedidor);
    });
  });

  describe('update', () => {
    it('should update a meter', async () => {
      const updateDto = { modelo: 'NEW_MODEL' };
      const result = await controller.update('1', updateDto);

      expect(service.update).toHaveBeenCalledWith(BigInt(1), updateDto);
      expect(result).toEqual(expectedMappedMedidor);
    });
  });

  describe('remove', () => {
    it('should delete a meter', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({ message: 'deleted' });
      const result = await controller.delete('1');

      expect(service.remove).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual({ message: 'deleted' });
    });
  });
});
