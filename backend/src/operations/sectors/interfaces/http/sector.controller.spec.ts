import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SectorController } from './sector.controller';
import { SectorService } from '../../application/sector.service';
import { SectorEntity } from '../../domain/entities/sector.entity';

describe('SectorController', () => {
  let controller: SectorController;

  const mockSectorService = {
    crearSector: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    actualizarSector: jest.fn(),
    eliminarSector: jest.fn(),
  };

  const sampleEntity = new SectorEntity(
    1,
    'Sector Centro',
    'SEC-001',
    1,
    { comunidadId: 1, codigo: 'COM-001', nombre: 'Comunidad 1' },
    null,
    new Date('2026-01-01'),
    new Date('2026-01-01'),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectorController],
      providers: [
        { provide: SectorService, useValue: mockSectorService },
      ],
    }).compile();

    controller = module.get<SectorController>(SectorController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should return SectorResponseDto', async () => {
    mockSectorService.crearSector.mockResolvedValue(sampleEntity);

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
      data: [sampleEntity],
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
    mockSectorService.findOne.mockResolvedValue(sampleEntity);

    const result = await controller.findOne(1);

    expect(result.sectorId).toBe(1);
    expect(mockSectorService.findOne).toHaveBeenCalledWith(1);
  });

  it('update should return updated SectorResponseDto', async () => {
    mockSectorService.actualizarSector.mockResolvedValue(sampleEntity);

    const result = await controller.update(1, { nombre: 'Nuevo Nombre' });

    expect(result.sectorId).toBe(1);
    expect(mockSectorService.actualizarSector).toHaveBeenCalledWith(1, { nombre: 'Nuevo Nombre' });
  });

  it('remove should return deleted SectorResponseDto', async () => {
    mockSectorService.eliminarSector.mockResolvedValue(sampleEntity);

    const result = await controller.remove(1);

    expect(result.sectorId).toBe(1);
    expect(mockSectorService.eliminarSector).toHaveBeenCalledWith(1);
  });
});
