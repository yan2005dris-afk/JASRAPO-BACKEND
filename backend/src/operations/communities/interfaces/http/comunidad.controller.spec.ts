import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ComunidadController } from './comunidad.controller';
import { ComunidadService } from '../../application/comunidad.service';
import type { CommunityFilterDto } from '../dto/community-filter.dto';

describe('ComunidadController', () => {
  let controller: ComunidadController;

  const mockComunidadService = {
    crearComunidad: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComunidadController],
      providers: [
        { provide: ComunidadService, useValue: mockComunidadService },
      ],
    }).compile();

    controller = module.get<ComunidadController>(ComunidadController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call service.findAll with pagination and filter params', async () => {
    const filters: CommunityFilterDto = { page: 2, limit: 5, nombre: 'test' };
    mockComunidadService.findAll.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 2, limit: 5, ultimaPagina: 0, paginaActual: 2, porPagina: 5, anterior: 1, siguiente: null },
    });

    await controller.findAll(filters);

    expect(mockComunidadService.findAll).toHaveBeenCalledWith(2, 5, filters);
  });

  it('findAll should use defaults when no pagination or filter provided', async () => {
    const filters: CommunityFilterDto = {};
    mockComunidadService.findAll.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, ultimaPagina: 0, paginaActual: 1, porPagina: 10, anterior: null, siguiente: null },
    });

    await controller.findAll(filters);

    expect(mockComunidadService.findAll).toHaveBeenCalledWith(1, 10, filters);
  });

  it('findAll should work with codigo filter only', async () => {
    const filters: CommunityFilterDto = { codigo: 'TC-001' };
    mockComunidadService.findAll.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 10, ultimaPagina: 0, paginaActual: 1, porPagina: 10, anterior: null, siguiente: null },
    });

    await controller.findAll(filters);

    expect(mockComunidadService.findAll).toHaveBeenCalledWith(1, 10, filters);
  });
});
