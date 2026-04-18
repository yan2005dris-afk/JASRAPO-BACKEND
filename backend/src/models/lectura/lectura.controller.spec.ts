import { Test, TestingModule } from '@nestjs/testing';
import { LecturaController } from './lectura.controller';
import { LecturaService } from './lectura.service';
import { LecturaEntity } from './entities/lectura.entity';

describe('LecturaController', () => {
  let controller: LecturaController;
  let lecturaService: jest.Mocked<LecturaService>;

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
    fotoUrlMinIo: null,
    isValidada: false,
    lecturaInicial: false,
    periodo: '2024-01',
    tieneAnomalia: false,
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockLecturaService = {
      crearLectura: jest.fn(),
      buscarLecturas: jest.fn(),
      buscarLectura: jest.fn(),
      actualizarLectura: jest.fn(),
      eliminarLectura: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LecturaController],
      providers: [
        {
          provide: LecturaService,
          useValue: mockLecturaService,
        },
      ],
    }).compile();

    controller = module.get<LecturaController>(LecturaController);
    lecturaService = module.get(LecturaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('crearLectura', () => {
    it('should create a new lectura', async () => {
      const crearDto = {
        fecha: '2024-01-15',
        lecturaAnterior: 100,
        lecturaActual: 150,
        consumoCalculado: 50,
        contratoId: '1',
        periodo: '2024-01',
      };

      lecturaService.crearLectura.mockResolvedValue(
        new LecturaEntity(mockLecturaData),
      );

      const result = await controller.CrearLectura(crearDto);

      expect(result).toBeInstanceOf(LecturaEntity);
      expect(lecturaService.crearLectura).toHaveBeenCalledWith(crearDto);
    });

    it('should handle creating lectura with anomalia', async () => {
      const crearDto = {
        fecha: '2024-01-15',
        lecturaAnterior: 100,
        lecturaActual: 150,
        consumoCalculado: 50,
        contratoId: '1',
        periodo: '2024-01',
        tieneAnomalia: true,
        descripcionAnomalia: 'Lectura fuera de rango',
      };

      const anomaliaData = { ...mockLecturaData, tieneAnomalia: true };
      lecturaService.crearLectura.mockResolvedValue(
        new LecturaEntity(anomaliaData),
      );

      const result = await controller.CrearLectura(crearDto);

      expect(result.tieneAnomalia).toBe(true);
    });
  });

  describe('buscarLecturas', () => {
    it('should return all lecturas', async () => {
      lecturaService.buscarLecturas.mockResolvedValue([
        new LecturaEntity(mockLecturaData),
      ]);

      const result = await controller.buscarLecturas();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(LecturaEntity);
      expect(lecturaService.buscarLecturas).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: {},
      });
    });

    it('should apply pagination parameters', async () => {
      lecturaService.buscarLecturas.mockResolvedValue([]);

      await controller.buscarLecturas(10, 5);

      expect(lecturaService.buscarLecturas).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        where: {},
      });
    });

    it('should filter by contratoId', async () => {
      lecturaService.buscarLecturas.mockResolvedValue([]);

      await controller.buscarLecturas(undefined, undefined, '1');

      expect(lecturaService.buscarLecturas).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: { contratoId: BigInt(1) },
      });
    });

    it('should return empty array when no lecturas exist', async () => {
      lecturaService.buscarLecturas.mockResolvedValue([]);

      const result = await controller.buscarLecturas();

      expect(result).toEqual([]);
    });
  });

  describe('buscarLectura', () => {
    it('should return a lectura by id', async () => {
      lecturaService.buscarLectura.mockResolvedValue(
        new LecturaEntity(mockLecturaData),
      );

      const result = await controller.buscarLectura('1');

      expect(result).toBeInstanceOf(LecturaEntity);
      expect(lecturaService.buscarLectura).toHaveBeenCalledWith(BigInt(1));
    });

    it('should pass string id to service', async () => {
      lecturaService.buscarLectura.mockResolvedValue(
        new LecturaEntity(mockLecturaData),
      );

      await controller.buscarLectura('999');

      expect(lecturaService.buscarLectura).toHaveBeenCalledWith(BigInt(999));
    });
  });

  describe('actualizarLectura', () => {
    it('should update a lectura', async () => {
      const updateDto = { lecturaActual: 200 };
      const updatedData = { ...mockLecturaData, lecturaActual: 200 };

      lecturaService.actualizarLectura.mockResolvedValue(
        new LecturaEntity(updatedData),
      );

      const result = await controller.actualizarLectura('1', updateDto);

      expect(result.lecturaActual).toBe(200);
      expect(lecturaService.actualizarLectura).toHaveBeenCalledWith(
        BigInt(1),
        updateDto,
      );
    });

    it('should pass string id and dto to service', async () => {
      const updateDto = { isValidada: true };
      lecturaService.actualizarLectura.mockResolvedValue(
        new LecturaEntity({ ...mockLecturaData, isValidada: true }),
      );

      await controller.actualizarLectura('1', updateDto);

      expect(lecturaService.actualizarLectura).toHaveBeenCalledWith(
        BigInt(1),
        updateDto,
      );
    });
  });

  describe('eliminarLectura', () => {
    it('should delete a lectura', async () => {
      const deleteResult = { message: 'Lectura eliminada correctamente' };
      lecturaService.eliminarLectura.mockResolvedValue(deleteResult);

      const result = await controller.eliminarLectura('1');

      expect(result).toEqual(deleteResult);
      expect(lecturaService.eliminarLectura).toHaveBeenCalledWith(BigInt(1));
    });

    it('should pass string id to service', async () => {
      lecturaService.eliminarLectura.mockResolvedValue({
        message: 'Deleted',
      });

      await controller.eliminarLectura('999');

      expect(lecturaService.eliminarLectura).toHaveBeenCalledWith(BigInt(999));
    });
  });
});