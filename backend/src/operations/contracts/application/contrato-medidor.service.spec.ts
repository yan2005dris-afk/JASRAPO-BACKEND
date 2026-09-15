jest.mock('puppeteer', () => ({}));

import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ContratoMedidorService } from './contrato-medidor.service';
import { CreateContractUseCase } from './use-cases/create-contract.use-case';
import { FindAllContractsUseCase } from './use-cases/find-all-contracts.use-case';
import { FindOneContractUseCase } from './use-cases/find-one-contract.use-case';
import { UpdateContractUseCase } from './use-cases/update-contract.use-case';
import { RemoveContractUseCase } from './use-cases/remove-contract.use-case';
import { FinalizeMeterLinkUseCase } from './use-cases/finalize-meter-link.use-case';
import { GetConnectionRequestPdfDataUseCase } from './use-cases/get-connection-request-pdf-data.use-case';
import { GetResponsibilityAgreementPdfDataUseCase } from './use-cases/get-responsibility-agreement-pdf-data.use-case';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { RouteRepository } from '../../routes/domain/repositories/route.repository';
import { OrdenTrabajoRepository } from '../../routes/domain/repositories/orden-trabajo.repository';
import {
  EstadoOrdenTrabajo,
  EstadoRuta,
  EstadoServicioContrato,
  TipoActividadCodes,
} from 'src/shared/enums';
import { ContractEntity } from '../domain/entities/contract.entity';
import { RouteEntity } from '../../routes/domain/entities/route.entity';

describe('ContratoMedidorService', () => {
  let service: ContratoMedidorService;

  const mockCreateContractUseCase = { execute: jest.fn() };
  const mockFindAllUseCase = { execute: jest.fn() };
  const mockFindOneUseCase = { execute: jest.fn() };
  const mockUpdateUseCase = { execute: jest.fn() };
  const mockRemoveUseCase = { execute: jest.fn() };
  const mockFinalizeLinkUseCase = { execute: jest.fn() };
  const mockGetConnectionRequestPdfData = { execute: jest.fn() };
  const mockGetResponsibilityAgreementPdfData = { execute: jest.fn() };
  const mockGeneratePdf = { execute: jest.fn() };
  const mockRouteRepository = {
    create: jest.fn(),
    findById: jest.fn(),
  };
  const mockOrdenTrabajoRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContratoMedidorService,
        { provide: CreateContractUseCase, useValue: mockCreateContractUseCase },
        { provide: FindAllContractsUseCase, useValue: mockFindAllUseCase },
        { provide: FindOneContractUseCase, useValue: mockFindOneUseCase },
        { provide: UpdateContractUseCase, useValue: mockUpdateUseCase },
        { provide: RemoveContractUseCase, useValue: mockRemoveUseCase },
        {
          provide: FinalizeMeterLinkUseCase,
          useValue: mockFinalizeLinkUseCase,
        },
        {
          provide: GetConnectionRequestPdfDataUseCase,
          useValue: mockGetConnectionRequestPdfData,
        },
        {
          provide: GetResponsibilityAgreementPdfDataUseCase,
          useValue: mockGetResponsibilityAgreementPdfData,
        },
        { provide: GeneratePdfUseCase, useValue: mockGeneratePdf },
        { provide: RouteRepository, useValue: mockRouteRepository },
        {
          provide: OrdenTrabajoRepository,
          useValue: mockOrdenTrabajoRepository,
        },
      ],
    }).compile();

    service = module.get<ContratoMedidorService>(ContratoMedidorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearContrato', () => {
    it('should delegate to CreateContractUseCase', async () => {
      const dto = {
        clienteId: '10',
        categoriaTarifaId: '3',
        medidorId: '200',
        numeroGuia: 'GUIA-001',
        direccionSuministro: 'Av. Principal 123',
        comunidadId: '2',
      };
      mockCreateContractUseCase.execute.mockResolvedValue({ id: 1 });

      const result = await service.crearContrato(dto);

      expect(result).toEqual({ id: 1 });
      expect(mockCreateContractUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('buscarContratos', () => {
    it('should delegate to FindAllContractsUseCase', async () => {
      const filters = { contratoId: '1', page: 1, limit: 10 } as any;
      const paginatedResult = {
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      };
      mockFindAllUseCase.execute.mockResolvedValue(paginatedResult);

      const result = await service.buscarContratos(filters);

      expect(result).toEqual(paginatedResult);
      expect(mockFindAllUseCase.execute).toHaveBeenCalledWith(1, 10, {
        contratoId: BigInt(1),
      });
    });
  });

  describe('buscarContrato', () => {
    it('should delegate to FindOneContractUseCase', async () => {
      const id = BigInt(1);
      mockFindOneUseCase.execute.mockResolvedValue({ id: 1 });

      const result = await service.buscarContrato(id);

      expect(result).toEqual({ id: 1 });
      expect(mockFindOneUseCase.execute).toHaveBeenCalledWith(id);
    });
  });

  describe('actualizar', () => {
    it('should delegate to UpdateContractUseCase', async () => {
      const id = BigInt(1);
      const dto = { estado: 'ACTIVO' };
      mockUpdateUseCase.execute.mockResolvedValue({ id: 1 });

      const result = await service.actualizar(id, dto);

      expect(result).toEqual({ id: 1 });
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('finalizarVinculo', () => {
    it('should delegate to FinalizeMeterLinkUseCase', async () => {
      const id = BigInt(1);
      mockFinalizeLinkUseCase.execute.mockResolvedValue({ id: 1 });

      const result = await service.finalizarVinculo(id);

      expect(result).toEqual({ id: 1 });
      expect(mockFinalizeLinkUseCase.execute).toHaveBeenCalledWith(id);
    });
  });

  describe('eliminar', () => {
    it('should delegate to RemoveContractUseCase', async () => {
      const id = BigInt(1);
      mockRemoveUseCase.execute.mockResolvedValue({ message: 'Deleted' });

      const result = await service.eliminar(id);

      expect(result).toEqual({ message: 'Deleted' });
      expect(mockRemoveUseCase.execute).toHaveBeenCalledWith(id);
    });
  });

  describe('assignInstallationRoute', () => {
    const contratoId = 10n;
    const contrato = new ContractEntity({
      contratoId,
      estado: 'ACTIVO',
      estadoServicio: EstadoServicioContrato.PENDIENTE_INSTALACION,
      estadoCobranza: 'PENDIENTE',
      numeroGuia: 'GUIA-010',
      comunidadId: 3,
      historialMedidores: null,
    });
    const existingRoute = new RouteEntity({
      rutaId: 20n,
      nombre: 'Instalaciones existentes',
      tipoRuta: TipoActividadCodes.INSTALACION,
      comunidadId: 3,
      periodoId: null,
      estado: EstadoRuta.PENDIENTE,
      fechaPlanificada: null,
      fechaInicio: null,
      fechaFin: null,
    });

    beforeEach(() => {
      mockFindOneUseCase.execute.mockResolvedValue(contrato);
      mockOrdenTrabajoRepository.create.mockResolvedValue({});
    });

    it('assigns a contract to a valid pending installation route', async () => {
      mockRouteRepository.findById.mockResolvedValue(existingRoute);

      const result = await service.assignInstallationRoute(contratoId, {
        routeId: 20,
      });

      expect(result).toBe(existingRoute);
      expect(mockOrdenTrabajoRepository.create).toHaveBeenCalledWith({
        rutaId: 20n,
        contratoId,
        medidorId: null,
        estado: EstadoOrdenTrabajo.PENDIENTE,
      });
      expect(
        mockOrdenTrabajoRepository.create.mock.calls[0][0],
      ).not.toHaveProperty('tipoActividad');
    });

    it('rejects a contract whose service lifecycle is not pending installation', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(
        new ContractEntity({
          ...contrato,
          estado: 'PENDIENTE_INSTALACION',
          estadoServicio: EstadoServicioContrato.ACTIVO,
        }),
      );

      await expect(
        service.assignInstallationRoute(contratoId, { routeId: 20 }),
      ).rejects.toThrow('PENDIENTE_INSTALACION');
      expect(mockRouteRepository.findById).not.toHaveBeenCalled();
    });

    it('rejects an existing route with a non-installation activity code', async () => {
      mockRouteRepository.findById.mockResolvedValue(
        new RouteEntity({
          ...existingRoute,
          tipoRuta: TipoActividadCodes.LECTURA,
        }),
      );

      await expect(
        service.assignInstallationRoute(contratoId, { routeId: 20 }),
      ).rejects.toThrow('tipo INSTALACION');
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
    });

    it('creates a new pending installation route when routeId is omitted', async () => {
      mockRouteRepository.create.mockResolvedValue(existingRoute);

      const result = await service.assignInstallationRoute(contratoId, {
        fechaPlanificada: '2026-08-20',
      });

      expect(result).toBe(existingRoute);
      expect(mockRouteRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Instalaciones GUIA-010',
          tipoRuta: TipoActividadCodes.INSTALACION,
          estado: EstadoRuta.PENDIENTE,
          operarioId: null,
        }),
      );
      expect(mockOrdenTrabajoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ rutaId: existingRoute.rutaId }),
      );
    });
  });
});
