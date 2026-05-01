import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MedidorController } from './medidor.controller';
import { MedidorService } from './medidor.service';

describe('MedidorController', () => {
  let controller: MedidorController;
  let service: MedidorService;

  const mockMedidor = {
    id: BigInt(1),
    numeroSerie: 'MED-001',
    modelo: 'DIGITAL_2000',
    estado: 'ACTIVO' as const,
    clienteId: BigInt(10),
    contratoId: BigInt(20),
    lecturaActual: BigInt(100),
    lecturaAnterior: BigInt(50),
    lecturaFecha: new Date('2024-01-15'),
    consumo: BigInt(50),
    promedio: BigInt(50),
    motivoBaja: null,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  };

  const mockMedidorService = {
    crearMedidor: jest.fn(() => Promise.resolve(mockMedidor)),
    buscarMedidores: jest.fn(() => Promise.resolve([mockMedidor])),
    buscarMedidor: jest.fn(() => Promise.resolve(mockMedidor)),
    actualizarMedidor: jest.fn(() => Promise.resolve(mockMedidor)),
    eliminarMedidor: jest.fn(() => Promise.resolve(undefined)),
    instalarMedidor: jest.fn(() => Promise.resolve(mockMedidor)),
    reportarDano: jest.fn(() => Promise.resolve(mockMedidor)),
    facturarPorPromedio: jest.fn(() => Promise.resolve(mockMedidor)),
    darDeBaja: jest.fn(() => Promise.resolve(mockMedidor)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedidorController],
      providers: [{ provide: MedidorService, useValue: mockMedidorService }],
    }).compile();

    controller = module.get<MedidorController>(MedidorController);
    service = module.get<MedidorService>(MedidorService);
  });

  describe('crear', () => {
    it('should create a medidor', async () => {
      const createDto = { numeroSerie: 'MED-001', modelo: 'DIGITAL_2000' };
      const result = await controller.crear(createDto);

      expect(service.crearMedidor).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('buscarTodos', () => {
    it('should return all medidores without pagination', async () => {
      const result = await controller.buscarTodos();

      expect(service.buscarMedidores).toHaveBeenCalledWith({});
      expect(result).toEqual([mockMedidor]);
    });

    it('should apply pagination when skip and take provided', async () => {
      const result = await controller.buscarTodos('10', '5');

      expect(service.buscarMedidores).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
      });
      expect(result).toEqual([mockMedidor]);
    });
  });

  describe('buscarUno', () => {
    it('should return a medidor by id', async () => {
      const result = await controller.buscarUno('1');

      expect(service.buscarMedidor).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('actualizar', () => {
    it('should update a medidor', async () => {
      const updateDto = { lecturaActual: 150 };
      const result = await controller.actualizar('1', updateDto);

      expect(service.actualizarMedidor).toHaveBeenCalledWith(
        BigInt(1),
        updateDto,
      );
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('eliminar', () => {
    it('should delete a medidor', async () => {
      const result = await controller.eliminar('1');

      expect(service.eliminarMedidor).toHaveBeenCalledWith(BigInt(1));
      expect(result).toBeUndefined();
    });
  });

  describe('install', () => {
    it('should install a medidor with contratoId', async () => {
      const result = await controller.install('1', '20');

      expect(service.instalarMedidor).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(20),
      );
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('reportDamage', () => {
    it('should report damage for a medidor', async () => {
      const result = await controller.reportDamage('1');

      expect(service.reportarDano).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('billAverage', () => {
    it('should facturar por promedio for a medidor', async () => {
      const result = await controller.billAverage('1');

      expect(service.facturarPorPromedio).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('decommission', () => {
    it('should dar de baja a medidor with motivo', async () => {
      const result = await controller.decommission('1', 'OBSOLETO');

      expect(service.darDeBaja).toHaveBeenCalledWith(BigInt(1), 'OBSOLETO');
      expect(result).toEqual(mockMedidor);
    });
  });
});
