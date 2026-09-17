import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RoutesController } from './routes.controller';
import { RoutesService } from '../../application/routes.service';
import { OrdenesTrabajoService } from '../../application/ordenes-trabajo.service';
import { ReassignRouteUseCase } from '../../application/use-cases/reassign-route.use-case';
import { RouteEntity } from '../../domain/entities/route.entity';
import { ReadingForRouteEntity } from '../../domain/entities/reading-for-route.entity';

describe('RoutesController', () => {
  let controller: RoutesController;

  const mockRoutesService = {
    getEligibleReadings: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockReassignRouteUseCase = {
    execute: jest.fn(),
  };

  const mockOrdenestrabajoService = {
    findByRutaId: jest.fn(),
    updateEstado: jest.fn(),
    linkLectura: jest.fn(),
  };

  const sampleRoute = new RouteEntity({
    rutaId: 1n,
    nombre: 'Ruta 1',
    operarioId: 10,
    tipoRuta: 'LECTURA',
    comunidadId: 1,
    periodoId: 1,
    estado: 'PENDIENTE',
    fechaPlanificada: null,
    fechaInicio: null,
    fechaFin: null,
  });

  const sampleReading = new ReadingForRouteEntity({
    lecturaId: 100n,
    guia: 'G-001',
    clienteNombre: 'Juan Perez',
    direccion: 'Av. 1',
    sector: 'Sector 1',
    estadoContrato: 'ACTIVO',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutesController],
      providers: [
        {
          provide: RoutesService,
          useValue: mockRoutesService,
        },
        {
          provide: OrdenesTrabajoService,
          useValue: mockOrdenestrabajoService,
        },
        {
          provide: ReassignRouteUseCase,
          useValue: mockReassignRouteUseCase,
        },
      ],
    }).compile();

    controller = module.get<RoutesController>(RoutesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getEligibleReadings should return paginated ReadingForRouteResponseDto', async () => {
    mockRoutesService.getEligibleReadings.mockResolvedValue({
      data: [sampleReading],
      meta: { total: 1, page: 1, limit: 10 },
    });

    const result = await controller.getEligibleReadings({
      tipoRuta: 'LECTURA',
      comunidadId: 1,
    } as any);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].lecturaId).toBe(100n);
    expect(result.data[0].guia).toBe('G-001');
  });

  it('create should return RouteResponseDto', async () => {
    mockRoutesService.create.mockResolvedValue(sampleRoute);

    const result = await controller.create({
      nombre: 'Ruta 1',
      operarioId: 10,
      tipoRuta: 'LECTURA',
      comunidadId: 1,
      periodoId: 1,
    });

    expect(result.rutaId).toBe(1n);
    expect(result.nombre).toBe('Ruta 1');
  });

  it('findAll should return paginated RouteResponseDto', async () => {
    mockRoutesService.findAll.mockResolvedValue({
      data: [sampleRoute],
      meta: { total: 1, page: 1, limit: 10 },
    });

    const result = await controller.findAll({
      page: 1,
      limit: 10,
      estado: 'PENDIENTE',
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].rutaId).toBe(1n);
  });

  it('findOne should return RouteResponseDto', async () => {
    mockRoutesService.findOne.mockResolvedValue(sampleRoute);

    const result = await controller.findOne(1n);

    expect(result.rutaId).toBe(1n);
  });

  it('update should return RouteResponseDto', async () => {
    mockRoutesService.update.mockResolvedValue(sampleRoute);

    const result = await controller.update(1n, { nombre: 'Updated' });

    expect(result.rutaId).toBe(1n);
  });

  it('reassign should return RouteResponseDto', async () => {
    mockReassignRouteUseCase.execute.mockResolvedValue(sampleRoute);

    const result = await controller.reassign(1n, { operarioId: 20 });

    expect(result.rutaId).toBe(1n);
    expect(mockReassignRouteUseCase.execute).toHaveBeenCalledWith(1n, 20);
  });

  it('delete should return RouteResponseDto', async () => {
    mockRoutesService.delete.mockResolvedValue(sampleRoute);

    const result = await controller.delete(1n);

    expect(result.rutaId).toBe(1n);
  });
});
