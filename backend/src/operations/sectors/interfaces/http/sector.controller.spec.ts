import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SectorController } from './sector.controller';
import { SectorService } from '../../application/sector.service';
import { sectorRow } from '../../__test-utils__/sector-row.factory';

describe('SectorController', () => {
  let controller: SectorController;

  const mockSectorService = {
    crearSector: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    actualizarSector: jest.fn(),
    eliminarSector: jest.fn(),
  };

  const sampleRow = sectorRow({
    sectorId: 1,
    nombre: 'Sector Centro',
    codigo: 'SEC-001',
    comunidadId: 1,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectorController],
      providers: [{ provide: SectorService, useValue: mockSectorService }],
    }).compile();

    controller = module.get<SectorController>(SectorController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should return SectorResponseDto', async () => {
    mockSectorService.crearSector.mockResolvedValue(sampleRow);

    const result = await controller.create({
      nombre: 'Sector Centro',
      codigo: 'SEC-001',
      comunidadId: 1,
    });

    expect(result.sectorId).toBe(1);
    expect(result.nombre).toBe('Sector Centro');
    expect(result.codigo).toBe('SEC-001');
    expect(result.comunidadId).toBe(1);
  });

  it('findAll should return paginated SectorResponseDto list', async () => {
    mockSectorService.findAll.mockResolvedValue({
      data: [sampleRow],
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
    });

    const result = await controller.findAll({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].sectorId).toBe(1);
    expect(mockSectorService.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('findOne should return SectorResponseDto', async () => {
    mockSectorService.findOne.mockResolvedValue(sampleRow);

    const result = await controller.findOne(1);

    expect(result.sectorId).toBe(1);
    expect(mockSectorService.findOne).toHaveBeenCalledWith(1);
  });

  it('update should return updated SectorResponseDto', async () => {
    mockSectorService.actualizarSector.mockResolvedValue(sampleRow);

    const result = await controller.update(1, { nombre: 'Nuevo Nombre' });

    expect(result.sectorId).toBe(1);
    expect(mockSectorService.actualizarSector).toHaveBeenCalledWith(1, {
      nombre: 'Nuevo Nombre',
    });
  });

  it('remove should return deleted SectorResponseDto', async () => {
    mockSectorService.eliminarSector.mockResolvedValue(sampleRow);

    const result = await controller.remove(1);

    expect(result.sectorId).toBe(1);
    expect(mockSectorService.eliminarSector).toHaveBeenCalledWith(1);
  });
});
