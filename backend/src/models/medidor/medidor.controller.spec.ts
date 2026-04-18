import { Test, TestingModule } from '@nestjs/testing';
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedidorController],
      providers: [
        {
          provide: MedidorService,
          useValue: {
            crearMedidor: jest.fn(),
            buscarMedidores: jest.fn(),
            buscarMedidor: jest.fn(),
            actualizarMedidor: jest.fn(),
            eliminarMedidor: jest.fn(),
            instalarMedidor: jest.fn(),
            reportarDano: jest.fn(),
            facturarPorPromedio: jest.fn(),
            darDeBaja: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MedidorController>(MedidorController);
    service = module.get<MedidorService>(MedidorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('crear', () => {
    it('should create a medidor', () => {
      const createDto = { numeroSerie: 'MED-001', modelo: 'DIGITAL_2000' };
      jest.spyOn(service, 'crearMedidor').mockResolvedValue(mockMedidor);

      const result = controller.crear(createDto);

      expect(service.crearMedidor).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('buscarTodos', () => {
    it('should return all medidores without pagination', () => {
      const medidores = [mockMedidor];
      jest.spyOn(service, 'buscarMedidores').mockResolvedValue(medidores);

      const result = controller.buscarTodos();

      expect(service.buscarMedidores).toHaveBeenCalledWith({});
      expect(result).toEqual(medidores);
    });

    it('should apply pagination when skip and take provided', () => {
      const medidores = [mockMedidor];
      jest.spyOn(service, 'buscarMedidores').mockResolvedValue(medidores);

      const result = controller.buscarTodos('10', '5');

      expect(service.buscarMedidores).toHaveBeenCalledWith({ skip: 10, take: 5 });
      expect(result).toEqual(medidores);
    });
  });

  describe('buscarUno', () => {
    it('should return a medidor by id', () => {
      jest.spyOn(service, 'buscarMedidor').mockResolvedValue(mockMedidor);

      const result = controller.buscarUno('1');

      expect(service.buscarMedidor).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('actualizar', () => {
    it('should update a medidor', () => {
      const updateDto = { lecturaActual: 150 };
      jest.spyOn(service, 'actualizarMedidor').mockResolvedValue(mockMedidor);

      const result = controller.actualizar('1', updateDto);

      expect(service.actualizarMedidor).toHaveBeenCalledWith(BigInt(1), updateDto);
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('eliminar', () => {
    it('should delete a medidor', () => {
      jest.spyOn(service, 'eliminarMedidor').mockResolvedValue(undefined);

      const result = controller.eliminar('1');

      expect(service.eliminarMedidor).toHaveBeenCalledWith(BigInt(1));
      expect(result).toBeUndefined();
    });
  });

  describe('instalar', () => {
    it('should install a medidor with contratoId', () => {
      jest.spyOn(service, 'instalarMedidor').mockResolvedValue(mockMedidor);

      const result = controller.instalar('1', '20');

      expect(service.instalarMedidor).toHaveBeenCalledWith(BigInt(1), BigInt(20));
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('reportarDano', () => {
    it('should report damage for a medidor', () => {
      jest.spyOn(service, 'reportarDano').mockResolvedValue(mockMedidor);

      const result = controller.reportarDano('1');

      expect(service.reportarDano).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('facturarPorPromedio', () => {
    it('should facturar por promedio for a medidor', () => {
      jest.spyOn(service, 'facturarPorPromedio').mockResolvedValue(mockMedidor);

      const result = controller.facturarPorPromedio('1');

      expect(service.facturarPorPromedio).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(mockMedidor);
    });
  });

  describe('darDeBaja', () => {
    it('should dar de baja a medidor with motivo', () => {
      jest.spyOn(service, 'darDeBaja').mockResolvedValue(mockMedidor);

      const result = controller.darDeBaja('1', 'OBSOLETO');

      expect(service.darDeBaja).toHaveBeenCalledWith(BigInt(1), 'OBSOLETO');
      expect(result).toEqual(mockMedidor);
    });
  });
});