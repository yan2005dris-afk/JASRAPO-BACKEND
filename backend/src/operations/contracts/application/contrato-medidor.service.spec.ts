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
import { GetServiceAreaUseCase } from './use-cases/get-service-area.use-case';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { RouteRepository } from '../../routes/domain/repositories/route.repository';
import { OrdenTrabajoRepository } from 'src/operations/work-orders/domain/repositories/orden-trabajo.repository';
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
  const mockGetServiceAreaUseCase = { execute: jest.fn() };
  const mockGeneratePdf = { execute: jest.fn() };
  const mockRouteRepository = {
    create: jest.fn(),
    findById: jest.fn(),
  };
  const mockOrdenTrabajoRepository = {
    create: jest.fn(),
    assignInstallationRoute: jest.fn(),
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
        {
          provide: GetServiceAreaUseCase,
          useValue: mockGetServiceAreaUseCase,
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
        direccionSuministro: 'Av. Principal 123',
        comunidadId: '2',
      };
      mockCreateContractUseCase.execute.mockResolvedValue({ id: 1 });

      const result = await service.crearContrato(dto, 7, 'ADMIN');

      expect(result).toEqual({ id: 1 });
      expect(mockCreateContractUseCase.execute).toHaveBeenCalledWith(
        dto,
        7,
        'ADMIN',
      );
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
      const dto = { estadoServicio: 'ACTIVO' as const };
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

  describe('getServiceArea', () => {
    it('should delegate to GetServiceAreaUseCase', () => {
      const serviceArea = {
        nombre: 'Parroquia Manglaralto',
        fuente: 'OpenStreetMap (relation 278708), ODbL',
        geometria: { type: 'Polygon', coordinates: [] },
      };
      mockGetServiceAreaUseCase.execute.mockReturnValue(serviceArea);

      const result = service.getServiceArea();

      expect(result).toEqual(serviceArea);
      expect(mockGetServiceAreaUseCase.execute).toHaveBeenCalledWith();
    });
  });

  describe('assignInstallationRoute', () => {
    it('returns the route of the existing installation order', async () => {
      mockOrdenTrabajoRepository.assignInstallationRoute.mockResolvedValue(20n);
      mockRouteRepository.findById.mockResolvedValue({ rutaId: 20n });
      expect(
        await service.assignInstallationRoute(1n, { routeId: 20 }),
      ).toEqual({ rutaId: 20n });
      expect(
        mockOrdenTrabajoRepository.assignInstallationRoute,
      ).toHaveBeenCalledWith(1n, 20n);
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
    });

    it('propagates invalid assignments', async () => {
      mockOrdenTrabajoRepository.assignInstallationRoute.mockRejectedValue(
        new Error('Invalid route'),
      );
      await expect(
        service.assignInstallationRoute(1n, { routeId: 20 }),
      ).rejects.toThrow('Invalid route');
    });
  });
});
