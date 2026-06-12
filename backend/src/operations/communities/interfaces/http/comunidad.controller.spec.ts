import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ComunidadController } from './comunidad.controller';
import { ComunidadService } from '../../application/comunidad.service';

describe('ComunidadController', () => {
  let controller: ComunidadController;

  const mockComunidadService = {
    crearComunidad: jest.fn(),
    findAll: jest.fn(),
    findAllWithSector: jest.fn(),
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

  it('findAll should call service.findAll with pagination params', async () => {
    const paginationDto = { page: 2, limit: 5 };
    await controller.findAll(paginationDto);
    expect(mockComunidadService.findAll).toHaveBeenCalledWith(2, 5);
  });

  it('findAll should use defaults when no pagination provided', async () => {
    await controller.findAll({ page: 1, limit: 10 });
    expect(mockComunidadService.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('findAllWithSector should pass sectorId and pagination', async () => {
    await controller.findAllWithSector('3', '1', '20');
    expect(mockComunidadService.findAllWithSector).toHaveBeenCalledWith({
      sectorId: 3,
      page: 1,
      limit: 20,
    });
  });

  it('findAllWithSector should work without sectorId', async () => {
    await controller.findAllWithSector(undefined, '2', '10');
    expect(mockComunidadService.findAllWithSector).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
    });
  });
});
