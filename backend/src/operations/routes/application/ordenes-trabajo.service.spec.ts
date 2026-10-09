import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { OrdenesTrabajoService } from './ordenes-trabajo.service';
import { FindOrdenesByRutaUseCase } from './use-cases/find-ordenes-by-ruta.use-case';
import { UpdateOrdenEstadoUseCase } from './use-cases/update-orden-estado.use-case';
import { LinkLecturaUseCase } from './use-cases/link-lectura.use-case';
import { OrdenTrabajoRepository } from '../domain/repositories/orden-trabajo.repository';
import { ordenTrabajoRow } from '../__test-utils__/route-row.factory';
import type {
  PaginatedResult,
  PaginationMeta,
} from 'src/shared/domain/types/pagination.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';

describe('OrdenesTrabajoService', () => {
  let service: OrdenesTrabajoService;

  const mockUseCase = { execute: jest.fn() };

  const makeMeta = (total: number, page = 1, limit = 10): PaginationMeta => ({
    total,
    page,
    limit,
    ultimaPagina: Math.max(1, Math.ceil(total / limit)),
    paginaActual: page,
    porPagina: limit,
    anterior: page > 1 ? page - 1 : null,
    siguiente: total > page * limit ? page + 1 : null,
  });

  const sampleOrden = ordenTrabajoRow({
    ordenTrabajoId: 1n,
    rutaId: 10n,
    contratoId: 100n,
    medidorId: 200n,
    estado: 'PENDIENTE',
    ordenVisita: 1,
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
    completadoEn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lecturaId: null,
    ruta: {
      tipoActividad: {
        codigo: 'INSTALACION',
      },
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenesTrabajoService,
        { provide: OrdenTrabajoRepository, useValue: {} },
        { provide: FindOrdenesByRutaUseCase, useValue: mockUseCase },
        { provide: UpdateOrdenEstadoUseCase, useValue: mockUseCase },
        { provide: LinkLecturaUseCase, useValue: mockUseCase },
      ],
    }).compile();

    service = module.get<OrdenesTrabajoService>(OrdenesTrabajoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByRuta', () => {
    it('should delegate to FindOrdenesByRutaUseCase with the same params', async () => {
      const pagination: PaginateOptions = { page: 1, limit: 10 };
      const paginated: PaginatedResult<any> = {
        data: [sampleOrden],
        meta: makeMeta(1),
      };
      mockUseCase.execute.mockResolvedValue(paginated);

      const result = await service.findByRuta({
        rutaId: 10n,
        filters: { estado: 'COMPLETADA' },
        pagination,
      });

      expect(mockUseCase.execute).toHaveBeenCalledWith({
        rutaId: 10n,
        filters: { estado: 'COMPLETADA' },
        pagination,
      });
      expect(result).toBe(paginated);
    });
  });

  describe('updateEstado', () => {
    it('should delegate to UpdateOrdenEstadoUseCase with the same args', async () => {
      const updatedOrden = ordenTrabajoRow({
        ...sampleOrden,
        estado: 'COMPLETADA',
      });
      mockUseCase.execute.mockResolvedValue(updatedOrden);

      const result = await service.updateEstado(
        1n,
        {
          estado: 'COMPLETADA',
          resultadoObservacion: 'all good',
        },
        42,
      );

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        1n,
        {
          estado: 'COMPLETADA',
          resultadoObservacion: 'all good',
        },
        42,
      );
      expect(result).toBe(updatedOrden);
    });
  });

  describe('linkLectura', () => {
    it('should delegate to LinkLecturaUseCase with the same args', async () => {
      const linked = ordenTrabajoRow({
        ...sampleOrden,
        lecturaId: 999n,
      });
      mockUseCase.execute.mockResolvedValue(linked);

      const result = await service.linkLectura(1n, { lecturaId: 999n }, 42);

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        1n,
        { lecturaId: 999n },
        42,
      );
      expect(result).toBe(linked);
      expect(result.lecturaId).toBe(999n);
    });
  });
});
