import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConveniosController } from './convenios.controller';
import { ConveniosService } from './convenios.service';

describe('ConveniosController', () => {
  let controller: ConveniosController;
  let service: ConveniosService;

  // ── Shared mock data ───────────────────────────────────────────────────────

  const mockEstadoConvenio = {
    estadoConvenioId: 1,
    codigo: 'PREPARADO',
    nombre: 'Preparado',
    descripcion: 'Convenio en preparación',
    orden: 1,
  };

  const mockEstadoCuota = {
    estadoCuotaConvenioId: 1,
    codigo: 'PENDIENTE',
    nombre: 'Pendiente',
    descripcion: 'Cuota pendiente de pago',
    orden: 1,
  };

  const mockCuota = {
    cuotaConvenioId: '1',
    convenioId: '1',
    numeroCuota: 1,
    valorCuota: 30.11,
    fechaVencimiento: '2026-06-01',
    estado: {
      estadoCuotaConvenioId: 1,
      codigo: 'PENDIENTE',
      nombre: 'Pendiente',
    },
    fechaPago: null,
    montoPagado: 0,
    saldoPendiente: 30.11,
    diasRetraso: 0,
    interesMoraAplicado: 1.5,
    pagoCompleto: false,
    fechaPagoAnticipado: null,
  };

  const mockConvenio = {
    convenioId: '1',
    contratoId: '1',
    numeroCuotas: 6,
    abonoInicial: 50,
    deudaTotal: 215.75,
    diasMoraActual: 30,
    estado: { estadoConvenioId: 1, codigo: 'PREPARADO', nombre: 'Preparado' },
    fechaAprobacion: null,
    fechaPrimerPago: '2026-06-01',
    fechaProximoPago: '2026-06-01',
    montoPagadoActual: 0,
    motivo: 'Test',
    fechaCreacion: '2026-05-10',
    cuotas: [mockCuota],
  };

  const mockDebtSummary = {
    contratoId: '1',
    deudaTotal: 215.75,
    tasaMensualVigente: 1.5,
    totalPrefacturasImpagadas: 2,
    prefacturas: [],
  };

  const mockService = {
    findAllEstadosConvenio: jest.fn(),
    findAllEstadosCuotaConvenio: jest.fn(),
    getDebtSummary: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findCuotas: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConveniosController],
      providers: [{ provide: ConveniosService, useValue: mockService }],
    }).compile();

    controller = module.get<ConveniosController>(ConveniosController);
    service = module.get<ConveniosService>(ConveniosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── GET /convenios/statuses ───────────────────────────────────────────────

  describe('findAllStatuses', () => {
    it('should return estado convenio catalog', async () => {
      mockService.findAllEstadosConvenio.mockResolvedValue([
        mockEstadoConvenio,
      ]);

      const result = await controller.findAllStatuses();

      expect(result).toEqual([mockEstadoConvenio]);
      expect(service.findAllEstadosConvenio).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no statuses exist', async () => {
      mockService.findAllEstadosConvenio.mockResolvedValue([]);

      const result = await controller.findAllStatuses();

      expect(result).toEqual([]);
    });
  });

  // ── GET /convenios/installment-statuses ───────────────────────────────────

  describe('findAllInstallmentStatuses', () => {
    it('should return estado cuota catalog', async () => {
      mockService.findAllEstadosCuotaConvenio.mockResolvedValue([
        mockEstadoCuota,
      ]);

      const result = await controller.findAllInstallmentStatuses();

      expect(result).toEqual([mockEstadoCuota]);
      expect(service.findAllEstadosCuotaConvenio).toHaveBeenCalledTimes(1);
    });
  });

  // ── GET /convenios/debt/:contratoId ──────────────────────────────────────

  describe('getDebtSummary', () => {
    it('should return debt summary for a contract', async () => {
      mockService.getDebtSummary.mockResolvedValue(mockDebtSummary);

      const result = await controller.getDebtSummary('1');

      expect(result).toEqual(mockDebtSummary);
      expect(service.getDebtSummary).toHaveBeenCalledWith('1');
    });
  });

  // ── POST /convenios ───────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a convenio and return it with cuotas', async () => {
      const dto = {
        contratoId: '1',
        numeroCuotas: 6,
        abonoInicial: 50,
        fechaPrimerPago: '2026-06-01',
        motivo: 'Test',
      };
      mockService.create.mockResolvedValue(mockConvenio);

      const result = await controller.create(dto);

      expect(result).toEqual(mockConvenio);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  // ── GET /convenios ────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all convenios without filter', async () => {
      mockService.findAll.mockResolvedValue([mockConvenio]);

      const result = await controller.findAll();

      expect(result).toEqual([mockConvenio]);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should pass contratoId query param to service', async () => {
      mockService.findAll.mockResolvedValue([mockConvenio]);

      const result = await controller.findAll('1');

      expect(result).toEqual([mockConvenio]);
      expect(service.findAll).toHaveBeenCalledWith('1');
    });
  });

  // ── GET /convenios/:id ────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a convenio by id with its cuotas', async () => {
      mockService.findOne.mockResolvedValue(mockConvenio);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockConvenio);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  // ── GET /convenios/:id/installments ──────────────────────────────────────

  describe('findInstallments', () => {
    it('should return cuotas for a given convenio', async () => {
      mockService.findCuotas.mockResolvedValue([mockCuota]);

      const result = await controller.findInstallments('1');

      expect(result).toEqual([mockCuota]);
      expect(service.findCuotas).toHaveBeenCalledWith('1');
    });

    it('should return empty array when convenio has no cuotas', async () => {
      mockService.findCuotas.mockResolvedValue([]);

      const result = await controller.findInstallments('1');

      expect(result).toEqual([]);
    });
  });

  // ── DELETE /convenios/:id ─────────────────────────────────────────────────

  describe('cancel', () => {
    it('should cancel (anular) a convenio and return updated state', async () => {
      const mockAnulado = {
        ...mockConvenio,
        estado: { estadoConvenioId: 6, codigo: 'ANULADO', nombre: 'Anulado' },
      };
      mockService.cancel.mockResolvedValue(mockAnulado);

      const result = await controller.cancel('1');

      expect(result.estado.codigo).toBe('ANULADO');
      expect(service.cancel).toHaveBeenCalledWith('1');
    });
  });
});
