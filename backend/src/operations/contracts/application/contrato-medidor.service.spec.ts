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
    findActiveInstallationByContratoId: jest.fn(),
    reassignInstallationOrder: jest.fn(),
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

  describe('Asignar un contrato a una ruta de instalación', () => {
    const contratoId = 10n;
    const contrato = new ContractEntity({
      contratoId,
      estadoServicio: EstadoServicioContrato.PENDIENTE_INSTALACION,
      estadoCobranza: 'NO_APLICA',
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
      fechaInicio: null,
      fechaFin: null,
    });

    beforeEach(() => {
      mockFindOneUseCase.execute.mockResolvedValue(contrato);
      mockOrdenTrabajoRepository.create.mockResolvedValue({});
      // Por defecto: el contrato no tiene una orden de instalación previa.
      mockOrdenTrabajoRepository.findActiveInstallationByContratoId.mockResolvedValue(
        null,
      );
    });

    it('asigna el contrato y crea una orden de trabajo pendiente para una ruta válida', async () => {
      // Given: existe un contrato pendiente y una ruta de instalación pendiente.
      mockRouteRepository.findById.mockResolvedValue(existingRoute);

      // When: se asigna el contrato a la ruta.
      const result = await service.assignInstallationRoute(contratoId, {
        routeId: 20,
      });

      // Then: se conserva la ruta y la orden toma la actividad desde ella.
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

    it('rechaza un contrato cuyo ciclo de servicio no está pendiente de instalación', async () => {
      // Given: el contrato ya no está pendiente de instalación.
      mockFindOneUseCase.execute.mockResolvedValue(
        new ContractEntity({
          ...contrato,
          estadoServicio: EstadoServicioContrato.ACTIVO,
        }),
      );

      // When: se intenta asignar el contrato a una ruta.
      // Then: la operación falla antes de consultar o modificar la ruta.
      await expect(
        service.assignInstallationRoute(contratoId, { routeId: 20 }),
      ).rejects.toThrow('PENDIENTE_INSTALACION');
      expect(mockRouteRepository.findById).not.toHaveBeenCalled();
    });

    it('rechaza una ruta existente cuya actividad no es instalación', async () => {
      // Given: la ruta existente pertenece a otra actividad.
      mockRouteRepository.findById.mockResolvedValue(
        new RouteEntity({
          ...existingRoute,
          tipoRuta: TipoActividadCodes.LECTURA,
        }),
      );

      // When / Then: la asignación es rechazada sin crear una orden.
      await expect(
        service.assignInstallationRoute(contratoId, { routeId: 20 }),
      ).rejects.toThrow('tipo INSTALACION');
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
    });

    it('crea una nueva ruta pendiente cuando no se proporciona routeId', async () => {
      // Given: el contrato está pendiente y no se selecciona una ruta existente.
      mockRouteRepository.create.mockResolvedValue(existingRoute);

      // When: se asigna el contrato sin routeId.
      const result = await service.assignInstallationRoute(contratoId, {});

      // Then: se crea una ruta de instalación sin operario y se genera su orden.
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

    it('rechaza una ruta de instalación que no está pendiente', async () => {
      // Given: la ruta existente está en progreso.
      mockRouteRepository.findById.mockResolvedValue(
        new RouteEntity({
          ...existingRoute,
          estado: EstadoRuta.EN_PROGRESO,
        }),
      );

      // When / Then: no se puede agregar el contrato ni crear una orden.
      await expect(
        service.assignInstallationRoute(contratoId, { routeId: 20 }),
      ).rejects.toThrow('estado PENDIENTE');
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
    });

    it('reasigna la orden existente a otra ruta sin crear duplicados', async () => {
      // Given: el contrato ya tiene una orden de instalación PENDIENTE en Ruta A.
      mockOrdenTrabajoRepository.findActiveInstallationByContratoId.mockResolvedValue(
        {
          ordenTrabajoId: 77n,
          rutaId: 20n,
          estado: EstadoOrdenTrabajo.PENDIENTE,
        },
      );
      const rutaDestino = new RouteEntity({
        ...existingRoute,
        rutaId: 30n,
        nombre: 'Instalaciones destino',
      });
      // findById se usa para la ruta actual (bloqueo) y para la ruta destino.
      mockRouteRepository.findById
        .mockResolvedValueOnce(existingRoute)
        .mockResolvedValueOnce(rutaDestino);
      mockOrdenTrabajoRepository.reassignInstallationOrder.mockResolvedValue(
        {},
      );

      // When: se reasigna el contrato a la Ruta B.
      const result = await service.assignInstallationRoute(contratoId, {
        routeId: 30,
      });

      // Then: se mueve la orden existente y NO se crea una nueva.
      expect(result).toBe(rutaDestino);
      expect(
        mockOrdenTrabajoRepository.reassignInstallationOrder,
      ).toHaveBeenCalledWith(77n, 30n);
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
    });

    it('bloquea la reasignación cuando la orden ya está EN_PROGRESO', async () => {
      mockOrdenTrabajoRepository.findActiveInstallationByContratoId.mockResolvedValue(
        {
          ordenTrabajoId: 77n,
          rutaId: 20n,
          estado: EstadoOrdenTrabajo.EN_PROGRESO,
        },
      );

      await expect(
        service.assignInstallationRoute(contratoId, { routeId: 30 }),
      ).rejects.toThrow('en progreso');
      expect(
        mockOrdenTrabajoRepository.reassignInstallationOrder,
      ).not.toHaveBeenCalled();
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
    });

    it('bloquea la reasignación cuando la instalación ya fue COMPLETADA', async () => {
      mockOrdenTrabajoRepository.findActiveInstallationByContratoId.mockResolvedValue(
        {
          ordenTrabajoId: 77n,
          rutaId: 20n,
          estado: EstadoOrdenTrabajo.COMPLETADA,
        },
      );

      await expect(
        service.assignInstallationRoute(contratoId, { routeId: 30 }),
      ).rejects.toThrow('completada');
      expect(mockOrdenTrabajoRepository.create).not.toHaveBeenCalled();
      expect(
        mockOrdenTrabajoRepository.reassignInstallationOrder,
      ).not.toHaveBeenCalled();
    });

    it('bloquea la reasignación cuando la ruta de origen ya inició', async () => {
      mockOrdenTrabajoRepository.findActiveInstallationByContratoId.mockResolvedValue(
        {
          ordenTrabajoId: 77n,
          rutaId: 20n,
          estado: EstadoOrdenTrabajo.PENDIENTE,
        },
      );
      mockRouteRepository.findById.mockResolvedValue(
        new RouteEntity({ ...existingRoute, estado: EstadoRuta.EN_PROGRESO }),
      );

      await expect(
        service.assignInstallationRoute(contratoId, { routeId: 30 }),
      ).rejects.toThrow('en progreso');
      expect(
        mockOrdenTrabajoRepository.reassignInstallationOrder,
      ).not.toHaveBeenCalled();
    });

    it('trata una orden CANCELADA/FALLIDA como inexistente y crea una nueva', async () => {
      // findActiveInstallationByContratoId excluye CANCELADA/FALLIDA => null.
      mockOrdenTrabajoRepository.findActiveInstallationByContratoId.mockResolvedValue(
        null,
      );
      mockRouteRepository.findById.mockResolvedValue(existingRoute);

      await service.assignInstallationRoute(contratoId, { routeId: 20 });

      expect(mockOrdenTrabajoRepository.create).toHaveBeenCalled();
      expect(
        mockOrdenTrabajoRepository.reassignInstallationOrder,
      ).not.toHaveBeenCalled();
    });
  });
});
