import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MeterController } from './meter.controller';
import { MeterService } from '../../application/meter.service';

describe('MeterController', () => {
  let controller: MeterController;
  let service: MeterService;

  const mockPaginatedResponse = {
    data: [
      {
        medidorId: BigInt(1),
        serie: 'MED-001',
        modelo: 'DIGITAL_2000',
        marca: 'Itron',
        estado: 'BODEGA',
        fechaInstalacion: null,
        fechaBaja: null,
        motivo: null,
        latitud: null,
        longitud: null,
      },
    ],
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
    kpis: {
      enBodega: 1,
      instalados: 0,
      danados: 0,
      total: 1,
    },
  };

  const mockMeterService = {
    create: jest.fn(() => Promise.resolve(mockPaginatedResponse.data[0])),
    findAll: jest.fn(() => Promise.resolve(mockPaginatedResponse)),
    findOne: jest.fn(() => Promise.resolve(mockPaginatedResponse.data[0])),
    update: jest.fn(() => Promise.resolve(mockPaginatedResponse.data[0])),
    remove: jest.fn(() => Promise.resolve(undefined)),
    install: jest.fn(() => Promise.resolve(mockPaginatedResponse.data[0])),
    reportDefect: jest.fn(() => Promise.resolve(mockPaginatedResponse.data[0])),
    decommission: jest.fn(() => Promise.resolve(mockPaginatedResponse.data[0])),
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
      expect(result).toEqual(mockPaginatedResponse.data[0]);
    });
  });

  describe('findAll', () => {
    it('should return paginated meters with defaults', async () => {
      const filterDto = { page: 1, limit: 10 };
      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should filter by estado', async () => {
      const filterDto = { page: 1, limit: 5, estado: 'BODEGA' };
      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a meter by id', async () => {
      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockPaginatedResponse.data[0]);
    });
  });

  describe('update', () => {
    it('should update a meter', async () => {
      const updateDto = { modelo: 'NEW_MODEL' };
      const result = await controller.update('1', updateDto);

      expect(service.update).toHaveBeenCalledWith(BigInt(1), updateDto);
      expect(result).toEqual(mockPaginatedResponse.data[0]);
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
