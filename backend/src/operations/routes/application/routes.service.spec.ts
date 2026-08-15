import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { GetEligibleReadingsUseCase } from './use-cases/get-eligible-readings.use-case';
import { CreateRouteUseCase } from './use-cases/create-route.use-case';
import { FindAllRoutesUseCase } from './use-cases/find-all-routes.use-case';
import { FindOneRouteUseCase } from './use-cases/find-one-route.use-case';
import { UpdateRouteUseCase } from './use-cases/update-route.use-case';
import { DeleteRouteUseCase } from './use-cases/delete-route.use-case';
import { RouteEntity } from '../domain/entities/route.entity';

describe('RoutesService', () => {
  let service: RoutesService;
  let getEligibleReadingsUseCase: GetEligibleReadingsUseCase;
  let createRouteUseCase: CreateRouteUseCase;
  let findAllRoutesUseCase: FindAllRoutesUseCase;
  let findOneRouteUseCase: FindOneRouteUseCase;
  let updateRouteUseCase: UpdateRouteUseCase;
  let deleteRouteUseCase: DeleteRouteUseCase;

  const mockUseCase = { execute: jest.fn() };

  const sampleRoute = new RouteEntity({
    rutaId: 1n,
    nombre: 'Ruta 1',
    operarioId: 1,
    tipoRuta: 'TOMA_LECTURA',
    comunidadId: 1,
    periodoId: 1,
    estado: 'PENDIENTE',
    fechaPlanificada: null,
    fechaInicio: null,
    fechaFin: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        {
          provide: GetEligibleReadingsUseCase,
          useValue: { execute: jest.fn() },
        },
        { provide: CreateRouteUseCase, useValue: { execute: jest.fn() } },
        { provide: FindAllRoutesUseCase, useValue: { execute: jest.fn() } },
        { provide: FindOneRouteUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateRouteUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteRouteUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
    getEligibleReadingsUseCase = module.get<GetEligibleReadingsUseCase>(
      GetEligibleReadingsUseCase,
    );
    createRouteUseCase = module.get<CreateRouteUseCase>(CreateRouteUseCase);
    findAllRoutesUseCase = module.get<FindAllRoutesUseCase>(
      FindAllRoutesUseCase,
    );
    findOneRouteUseCase = module.get<FindOneRouteUseCase>(FindOneRouteUseCase);
    updateRouteUseCase = module.get<UpdateRouteUseCase>(UpdateRouteUseCase);
    deleteRouteUseCase = module.get<DeleteRouteUseCase>(DeleteRouteUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getEligibleReadings should delegate to GetEligibleReadingsUseCase', async () => {
    const filterDto = {
      tipoRuta: 'TOMA_LECTURA' as const,
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
      tipoRuta: 'TOMA_LECTURA',
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
      tipoRuta: 'TOMA_LECTURA',
      comunidadId: 1,
      periodoId: 1,
    };
    const res = await service.create(dto as any);

    expect(createRouteUseCase.execute).toHaveBeenCalledWith(dto);
    expect(res).toEqual(sampleRoute);
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
});
