import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MeterController } from './meter.controller';
import { MeterService } from '../../application/meter.service';
import { EstadoMedidor } from 'src/shared/enums';

describe('MeterController', () => {
  let controller: MeterController;
  let service: MeterService;

  const mockMeterEntity = {
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
    contratoId: null,
    clienteNombre: null,
  };

  const expectedDto = {
    medidorId: '1',
    serie: 'MED-001',
    modelo: 'DIGITAL_2000',
    marca: 'Itron',
    estado: 'BODEGA',
    fechaInstalacion: null,
    fechaBaja: null,
    motivo: null,
    latitud: null,
    longitud: null,
    contratoId: null,
    clienteNombre: null,
  };

  const mockPaginatedResponse = {
    data: [mockMeterEntity],
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
    kpis: { enBodega: 1, instalados: 0, danados: 0, total: 1 },
  };

  const mockMeterService = {
    create: jest.fn(() => Promise.resolve(mockMeterEntity)),
    findAll: jest.fn(() => Promise.resolve(mockPaginatedResponse)),
    findOne: jest.fn(() => Promise.resolve(mockMeterEntity)),
    update: jest.fn(() => Promise.resolve(mockMeterEntity)),
    remove: jest.fn(() => Promise.resolve(undefined)),
    install: jest.fn(() => Promise.resolve(mockMeterEntity)),
    reportDefect: jest.fn(() => Promise.resolve(mockMeterEntity)),
    decommission: jest.fn(() => Promise.resolve(mockMeterEntity)),
    syncAll: jest.fn(() => Promise.resolve([mockMeterEntity])),
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
      expect(result).toEqual(expectedDto);
    });
  });

  describe('findAll', () => {
    it('should delegate empty filters to service', async () => {
      const filterDto = {};
      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result.data).toEqual([expectedDto]);
      expect(result.meta).toEqual(mockPaginatedResponse.meta);
    });

    it('should filter by estado', async () => {
      const filterDto = { page: 1, limit: 5, estado: EstadoMedidor.BODEGA };
      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result.data).toEqual([expectedDto]);
    });
  });

  describe('findOne', () => {
    it('should return a meter by id', async () => {
      const result = await controller.findOne(1n);

      expect(service.findOne).toHaveBeenCalledWith(1n);
      expect(result).toEqual(expectedDto);
    });
  });

  describe('update', () => {
    it('should update a meter', async () => {
      const updateDto = { modelo: 'NEW_MODEL' };
      const result = await controller.update(1n, updateDto);

      expect(service.update).toHaveBeenCalledWith(1n, updateDto);
      expect(result).toEqual(expectedDto);
    });
  });

  describe('remove', () => {
    it('should delete a meter', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({ message: 'deleted' });
      const result = await controller.delete(1n);

      expect(service.remove).toHaveBeenCalledWith(1n);
      expect(result).toEqual({ message: 'deleted' });
    });
  });

  describe('install', () => {
    it('should install a meter', async () => {
      jest.spyOn(service, 'install').mockResolvedValue(mockMeterEntity as any);
      const result = await controller.install(1n);

      expect(service.install).toHaveBeenCalledWith(1n);
      expect(result).toEqual(expectedDto);
    });
  });

  describe('syncAll', () => {
    it('should return all meters without pagination and lean payload', async () => {
      const result = await controller.syncAll();

      expect(service.syncAll).toHaveBeenCalled();
      expect(result).toEqual([
        {
          medidorId: '1',
          serie: 'MED-001',
          estado: 'BODEGA',
          latitud: null,
          longitud: null,
          contratoId: null,
          clienteNombre: null,
        },
      ]);
    });
  });
});
