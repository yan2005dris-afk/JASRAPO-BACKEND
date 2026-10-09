import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ComunidadController } from './comunidad.controller';
import { ComunidadService } from '../../application/comunidad.service';
import { communityRow } from '../../__test-utils__/community-row.factory';
import { Prisma } from 'src/generated/prisma/client';
import type { CommunityFilterDto } from '../dto/community-filter.dto';

describe('ComunidadController', () => {
  let controller: ComunidadController;

  const mockComunidadService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const sampleEntity = communityRow({
    comunidadId: 1,
    nombre: 'Comunidad Test',
    codigo: 'CT-001',
    porcentajeTasaSeguridad: new Prisma.Decimal(5),
    sector: [{ sectorId: 1, nombre: 'Sector 1', codigo: 'S1' }],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComunidadController],
      providers: [
        { provide: ComunidadService, useValue: mockComunidadService },
      ],
    }).compile();

    controller = module.get<ComunidadController>(ComunidadController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should return CommunityResponseDto', async () => {
    mockComunidadService.create.mockResolvedValue(sampleEntity);

    const result = await controller.create({
      nombre: 'Comunidad Test',
      codigo: 'CT-001',
      porcentajeTasaSeguridad: 5,
    });

    expect(result.comunidadId).toBe(1);
    expect(result.nombre).toBe('Comunidad Test');
    expect(result.codigo).toBe('CT-001');
    expect(result.sectores).toHaveLength(1);
  });

  it('findAll should call service.findAll with pagination and filter params', async () => {
    const filters: CommunityFilterDto = { page: 2, limit: 5, nombre: 'test' };
    mockComunidadService.findAll.mockResolvedValue({
      data: [sampleEntity],
      meta: {
        total: 1,
        page: 2,
        limit: 5,
        ultimaPagina: 1,
        paginaActual: 2,
        porPagina: 5,
        anterior: 1,
        siguiente: null,
      },
    });

    const result = await controller.findAll(filters);

    expect(mockComunidadService.findAll).toHaveBeenCalledWith(2, 5, filters);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].comunidadId).toBe(1);
  });

  it('findOne should return CommunityResponseDto', async () => {
    mockComunidadService.findOne.mockResolvedValue(sampleEntity);

    const result = await controller.findOne(1);

    expect(result.comunidadId).toBe(1);
    expect(mockComunidadService.findOne).toHaveBeenCalledWith(1);
  });

  it('update should return updated CommunityResponseDto', async () => {
    mockComunidadService.update.mockResolvedValue(sampleEntity);

    const result = await controller.update(1, { nombre: 'Nuevo Nombre' });

    expect(result.comunidadId).toBe(1);
    expect(mockComunidadService.update).toHaveBeenCalledWith(1, {
      nombre: 'Nuevo Nombre',
    });
  });

  it('delete should return deleted CommunityResponseDto', async () => {
    mockComunidadService.delete.mockResolvedValue(sampleEntity);

    const result = await controller.delete(1);

    expect(result.comunidadId).toBe(1);
    expect(mockComunidadService.delete).toHaveBeenCalledWith(1);
  });
});
