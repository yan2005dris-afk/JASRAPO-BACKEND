import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MeterController } from './meter.controller';
import { MeterService } from '../../application/meter.service';
import { EstadoMedidor } from 'src/shared/enums';
import { Readable } from 'node:stream';

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
    direccionSuministro: null,
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
    direccionSuministro: null,
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

  let mockMeterService: { [K in keyof MeterService]: jest.Mock };

  beforeEach(async () => {
    mockMeterService = {
      create: jest.fn(() => Promise.resolve(mockMeterEntity)),
      findAll: jest.fn(() => Promise.resolve(mockPaginatedResponse)),
      findOne: jest.fn(() => Promise.resolve(mockMeterEntity)),
      update: jest.fn(() => Promise.resolve(mockMeterEntity)),
      remove: jest.fn(() => Promise.resolve(undefined)),
      exportCsv: jest.fn(() => Promise.resolve(Readable.from(['csv']))),
      exportPdf: jest.fn(() => Promise.resolve(Buffer.from('%PDF-1.4'))),
    } as any;

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
      expect(result.data).toEqual([mockMeterEntity]);
      expect(result.meta).toEqual(mockPaginatedResponse.meta);
    });

    it('should filter by estado', async () => {
      const filterDto = { page: 1, limit: 5, estado: EstadoMedidor.BODEGA };
      const result = await controller.findAll(filterDto);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result.data).toEqual([mockMeterEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a meter by id', async () => {
      const result = await controller.findOne(1n);

      expect(service.findOne).toHaveBeenCalledWith(1n);
      expect(result).toEqual(expectedDto);
    });
  });

  describe('export', () => {
    it('should stream CSV with download headers', async () => {
      const response = {
        setHeader: jest.fn(),
      } as any;
      const filters = { search: 'MED-001' };
      const pipe = jest.fn();
      jest.spyOn(service, 'exportCsv').mockResolvedValue({ pipe } as any);

      await controller.exportCsv(filters, response);

      expect(service.exportCsv).toHaveBeenCalledWith(filters);
      expect(pipe).toHaveBeenCalledWith(response);
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv; charset=utf-8',
      );
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringMatching(
          /^attachment; filename="inventario-medidores-\d{4}-\d{2}-\d{2}\.csv"$/,
        ),
      );
    });

    it('should send PDF with download headers', async () => {
      const response = {
        setHeader: jest.fn(),
        end: jest.fn(),
      } as any;
      const filters = { estado: EstadoMedidor.BODEGA };

      await controller.exportPdf(filters, response);

      expect(service.exportPdf).toHaveBeenCalledWith(filters);
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringMatching(
          /^attachment; filename="inventario-medidores-\d{4}-\d{2}-\d{2}\.pdf"$/,
        ),
      );
      expect(response.end).toHaveBeenCalledWith(Buffer.from('%PDF-1.4'));
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
});
