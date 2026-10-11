import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RoutesController } from './routes.controller';
import { RoutesService } from '../../application/routes.service';
import { OrdenesTrabajoService } from 'src/operations/work-orders/application/ordenes-trabajo.service';
import { ReassignRouteUseCase } from '../../application/use-cases/reassign-route.use-case';
import {
  routeRow,
  readingForRouteRow,
} from '../../__test-utils__/route-row.factory';

describe('RoutesController', () => {
  let controller: RoutesController;

  const mockRoutesService = {
    getPeriodos: jest.fn(),
    getTiposActividad: jest.fn(),
    getEligibleReadings: jest.fn(),
    create: jest.fn(),
    createAssignments: jest.fn(),
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

  const sampleRoute = routeRow({
    rutaId: 1n,
    nombre: 'Ruta 1',
    operarioId: 10,
    tipoRutaId: 1,
    comunidadId: 1,
    periodoId: 1,
    estadoId: 1,
    fechaInicio: null,
    fechaFin: null,
  });

  const sampleReading = readingForRouteRow({
    lecturaId: 100n,
    ordenLectura: 1,
    contrato: {
      numeroContrato: 'G-001',
      cliente: {
        nombres: 'Juan',
        apellidos: 'Perez',
      },
      direccion: 'Av. 1',
      sector: 'Sector 1',
      estado: {
        nombre: 'ACTIVO',
      },
    },
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

  it('createAssignments should return array of RouteResponseDto', async () => {
    mockRoutesService.createAssignments.mockResolvedValue([sampleRoute]);

    const result = await controller.createAssignments({
      operarioId: 10,
      comunidadId: 1,
      periodoId: 1,
      sectorIds: [2],
    });

    expect(result).toHaveLength(1);
    expect(result[0].rutaId).toBe(1n);
    expect(mockRoutesService.createAssignments).toHaveBeenCalled();
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

  it('getPeriods should delegate to RoutesService.getPeriodos', async () => {
    const mockPeriods = [{ periodoId: 1, nombre: '2026', estado: 'ABIERTO' }];
    mockRoutesService.getPeriodos.mockResolvedValue(mockPeriods);

    const result = await controller.getPeriods();

    expect(mockRoutesService.getPeriodos).toHaveBeenCalled();
    expect(result).toEqual(mockPeriods);
  });

  it('getActivityTypes should delegate to RoutesService.getTiposActividad', async () => {
    const mockTipos = [
      {
        tipoActividadId: 1,
        codigo: 'LECTURA',
        nombre: 'Lectura',
        activo: true,
      },
    ];
    mockRoutesService.getTiposActividad.mockResolvedValue(mockTipos);

    const result = await controller.getActivityTypes();

    expect(mockRoutesService.getTiposActividad).toHaveBeenCalled();
    expect(result).toEqual(mockTipos);
  });
});
