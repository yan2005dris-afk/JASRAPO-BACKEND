import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { GetEligibleReadingsUseCase } from './use-cases/get-eligible-readings.use-case';
import { GetReadingsByRutaUseCase } from './use-cases/get-readings-by-ruta.use-case';
import { CreateRouteUseCase } from './use-cases/create-route.use-case';
import { CreateRouteAssignmentsUseCase } from './use-cases/create-route-assignments.use-case';
import { FindAllRoutesUseCase } from './use-cases/find-all-routes.use-case';
import { FindOneRouteUseCase } from './use-cases/find-one-route.use-case';
import { UpdateRouteUseCase } from './use-cases/update-route.use-case';
import { DeleteRouteUseCase } from './use-cases/delete-route.use-case';
import { ExportFieldSheetPdfUseCase } from './use-cases/export-field-sheet-pdf.use-case';
import { RouteRepository } from '../domain/repositories/route.repository';
import { RouteEntity } from '../domain/entities/route.entity';

describe('RoutesService', () => {
  let service: RoutesService;
  let getEligibleReadingsUseCase: GetEligibleReadingsUseCase;
  let getReadingsByRutaUseCase: GetReadingsByRutaUseCase;
  let createRouteUseCase: CreateRouteUseCase;
  let createRouteAssignmentsUseCase: CreateRouteAssignmentsUseCase;
  let findAllRoutesUseCase: FindAllRoutesUseCase;
  let findOneRouteUseCase: FindOneRouteUseCase;
  let updateRouteUseCase: UpdateRouteUseCase;
  let deleteRouteUseCase: DeleteRouteUseCase;
  let exportFieldSheetPdfUseCase: ExportFieldSheetPdfUseCase;
  let routeRepository: RouteRepository;

  const mockUseCase = { execute: jest.fn() };

  const sampleRoute = new RouteEntity({
    rutaId: 1n,
    nombre: 'Ruta 1',
    operarioId: 1,
    tipoRuta: 'LECTURA',
    comunidadId: 1,
    periodoId: 1,
    estado: 'PENDIENTE',
    fechaInicio: null,
    fechaFin: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        {
          provide: RouteRepository,
          useValue: {
            findAllPeriodos: jest.fn(),
            findAllTiposActividad: jest.fn(),
          },
        },
        {
          provide: GetEligibleReadingsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetReadingsByRutaUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CreateRouteUseCase, useValue: { execute: jest.fn() } },
        {
          provide: CreateRouteAssignmentsUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: FindAllRoutesUseCase, useValue: { execute: jest.fn() } },
        { provide: FindOneRouteUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateRouteUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteRouteUseCase, useValue: { execute: jest.fn() } },
        {
          provide: ExportFieldSheetPdfUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
    routeRepository = module.get<RouteRepository>(RouteRepository);
    getEligibleReadingsUseCase = module.get<GetEligibleReadingsUseCase>(
      GetEligibleReadingsUseCase,
    );
    getReadingsByRutaUseCase = module.get<GetReadingsByRutaUseCase>(
      GetReadingsByRutaUseCase,
    );
    createRouteUseCase = module.get<CreateRouteUseCase>(CreateRouteUseCase);
    createRouteAssignmentsUseCase = module.get<CreateRouteAssignmentsUseCase>(
      CreateRouteAssignmentsUseCase,
    );
    findAllRoutesUseCase =
      module.get<FindAllRoutesUseCase>(FindAllRoutesUseCase);
    findOneRouteUseCase = module.get<FindOneRouteUseCase>(FindOneRouteUseCase);
    updateRouteUseCase = module.get<UpdateRouteUseCase>(UpdateRouteUseCase);
    deleteRouteUseCase = module.get<DeleteRouteUseCase>(DeleteRouteUseCase);
    exportFieldSheetPdfUseCase = module.get<ExportFieldSheetPdfUseCase>(
      ExportFieldSheetPdfUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getEligibleReadings should delegate to GetEligibleReadingsUseCase', async () => {
    const filterDto = {
      tipoRuta: 'LECTURA' as const,
      comunidadId: 1,
      page: 1,
      limit: 10,
    };
    (getEligibleReadingsUseCase.execute as jest.Mock).mockResolvedValue({
      data: [],
      meta: { total: 0 },
    });

    await service.getEligibleReadings(filterDto);

    expect(getEligibleReadingsUseCase.execute).toHaveBeenCalledWith({
      tipoRuta: 'LECTURA',
      comunidadId: 1,
      sectorId: undefined,
      search: undefined,
      pagination: { page: 1, limit: 10 },
    });
  });

  it('create should delegate to CreateRouteUseCase', async () => {
    (createRouteUseCase.execute as jest.Mock).mockResolvedValue(sampleRoute);

    const dto = {
      nombre: 'Ruta 1',
      operarioId: 1,
      tipoRuta: 'LECTURA',
      comunidadId: 1,
      periodoId: 1,
    };
    const res = await service.create(dto as any);

    expect(createRouteUseCase.execute).toHaveBeenCalledWith(dto);
    expect(res).toEqual(sampleRoute);
  });

  it('createAssignments should delegate to CreateRouteAssignmentsUseCase', async () => {
    (createRouteAssignmentsUseCase.execute as jest.Mock).mockResolvedValue([
      sampleRoute,
    ]);

    const dto = {
      operarioId: 1,
      comunidadId: 1,
      periodoId: 1,
      sectorIds: [2],
    };
    const res = await service.createAssignments(dto);

    expect(createRouteAssignmentsUseCase.execute).toHaveBeenCalledWith(dto);
    expect(res).toEqual([sampleRoute]);
  });

  it('findAll should delegate to FindAllRoutesUseCase', async () => {
    (findAllRoutesUseCase.execute as jest.Mock).mockResolvedValue({
      data: [sampleRoute],
      meta: { total: 1 },
    });

    const res = await service.findAll({
      pagination: { page: 1, limit: 10 },
      where: { estado: 'PENDIENTE' },
    });

    expect(findAllRoutesUseCase.execute).toHaveBeenCalledWith({
      pagination: { page: 1, limit: 10 },
      where: { estado: 'PENDIENTE' },
    });
    expect(res.data).toHaveLength(1);
  });

  it('findOne should delegate to FindOneRouteUseCase', async () => {
    (findOneRouteUseCase.execute as jest.Mock).mockResolvedValue(sampleRoute);

    const res = await service.findOne(1n);

    expect(findOneRouteUseCase.execute).toHaveBeenCalledWith(1n);
    expect(res).toEqual(sampleRoute);
  });

  it('update should delegate to UpdateRouteUseCase', async () => {
    (updateRouteUseCase.execute as jest.Mock).mockResolvedValue(sampleRoute);

    const res = await service.update(1n, { nombre: 'Nuevo Nombre' });

    expect(updateRouteUseCase.execute).toHaveBeenCalledWith(1n, {
      nombre: 'Nuevo Nombre',
    });
    expect(res).toEqual(sampleRoute);
  });

  it('delete should delegate to DeleteRouteUseCase', async () => {
    (deleteRouteUseCase.execute as jest.Mock).mockResolvedValue(sampleRoute);

    const res = await service.delete(1n);

    expect(deleteRouteUseCase.execute).toHaveBeenCalledWith(1n);
    expect(res).toEqual(sampleRoute);
  });

  it('getPeriodos should delegate to RouteRepository.findAllPeriodos', async () => {
    const mockPeriodos = [{ periodoId: 1, nombre: '2026', estado: 'ABIERTO' }];
    (routeRepository.findAllPeriodos as jest.Mock).mockResolvedValue(
      mockPeriodos,
    );

    const res = await service.getPeriodos();

    expect(routeRepository.findAllPeriodos).toHaveBeenCalled();
    expect(res).toEqual(mockPeriodos);
  });

  it('getTiposActividad should delegate to RouteRepository.findAllTiposActividad', async () => {
    const mockTipos = [
      {
        tipoActividadId: 1,
        codigo: 'LECTURA',
        nombre: 'Lectura',
        activo: true,
      },
    ];
    (routeRepository.findAllTiposActividad as jest.Mock).mockResolvedValue(
      mockTipos,
    );

    const res = await service.getTiposActividad();

    expect(routeRepository.findAllTiposActividad).toHaveBeenCalled();
    expect(res).toEqual(mockTipos);
  });
});
