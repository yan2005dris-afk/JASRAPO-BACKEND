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
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

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
    const makeContrato = (overrides: Record<string, any> = {}) => ({
      contratoId: BigInt(1),
      numeroGuia: 'NG-001',
      comunidadId: 1,
      estado: 'PENDIENTE_INSTALACION',
      historialMedidores: [{ medidorId: BigInt(50) }],
      ...overrides,
    });

    it('creates a new INSTALACION route and its work order when no routeId is given', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(makeContrato());
      const ruta = {
        rutaId: BigInt(99),
        tipoRuta: 'INSTALACION',
        estado: 'PENDIENTE',
      };
      mockRouteRepository.create.mockResolvedValue(ruta);

      const result = await service.assignInstallationRoute(BigInt(1), {});

      expect(mockRouteRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoRuta: 'INSTALACION',
          estado: 'PENDIENTE',
          comunidadId: 1,
          operarioId: null,
        }),
      );
      expect(mockOrdenTrabajoRepository.create).toHaveBeenCalledWith({
        rutaId: BigInt(99),
        contratoId: BigInt(1),
        medidorId: BigInt(50),
        tipoActividad: 'INSTALACION',
        estado: 'PENDIENTE',
      });
      expect(result).toBe(ruta);
    });

    it('uses an existing PENDIENTE INSTALACION route when routeId is given', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(makeContrato());
      const existing = {
        rutaId: BigInt(42),
        tipoRuta: 'INSTALACION',
        estado: 'PENDIENTE',
      };
      mockRouteRepository.findById.mockResolvedValue(existing);

      const result = await service.assignInstallationRoute(BigInt(1), {
        routeId: 42,
      });

      expect(mockRouteRepository.findById).toHaveBeenCalledWith(BigInt(42));
      expect(mockRouteRepository.create).not.toHaveBeenCalled();
      expect(mockOrdenTrabajoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rutaId: BigInt(42),
          tipoActividad: 'INSTALACION',
        }),
      );
      expect(result).toBe(existing);
    });

    it('rejects when the contract is not in PENDIENTE_INSTALACION', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(
        makeContrato({ estado: 'ACTIVO' }),
      );

      await expect(
        service.assignInstallationRoute(BigInt(1), {}),
      ).rejects.toThrow(InvalidDomainOperationException);
      expect(mockRouteRepository.create).not.toHaveBeenCalled();
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
    });

    it('rejects when the given route does not exist', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(makeContrato());
      mockRouteRepository.findById.mockResolvedValue(null);

      await expect(
        service.assignInstallationRoute(BigInt(1), { routeId: 42 }),
      ).rejects.toThrow(EntityNotFoundException);
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
    });

    it('rejects when the given route is not of type INSTALACION', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(makeContrato());
      mockRouteRepository.findById.mockResolvedValue({
        rutaId: BigInt(42),
        tipoRuta: 'TOMA_LECTURA',
        estado: 'PENDIENTE',
      });

      await expect(
        service.assignInstallationRoute(BigInt(1), { routeId: 42 }),
      ).rejects.toThrow(InvalidDomainOperationException);
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
    });

    it('rejects when the given route is not in PENDIENTE state', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(makeContrato());
      mockRouteRepository.findById.mockResolvedValue({
        rutaId: BigInt(42),
        tipoRuta: 'INSTALACION',
        estado: 'EN_PROGRESO',
      });

      await expect(
        service.assignInstallationRoute(BigInt(1), { routeId: 42 }),
      ).rejects.toThrow(InvalidDomainOperationException);
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
    });

    it('links the work order with null medidorId when the contract has no meter history', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(
        makeContrato({ historialMedidores: [] }),
      );
      mockRouteRepository.create.mockResolvedValue({
        rutaId: BigInt(99),
        tipoRuta: 'INSTALACION',
        estado: 'PENDIENTE',
      });

      await service.assignInstallationRoute(BigInt(1), {});

      expect(mockOrdenTrabajoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ medidorId: null }),
      );
    });
  });
});
