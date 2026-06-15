import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetConnectionRequestPdfDataUseCase } from './get-connection-request-pdf-data.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';

const makeContrato = (overrides: Partial<ContractEntity> = {}): ContractEntity =>
  new ContractEntity({
    contratoId: BigInt(1),
    clienteId: BigInt(10),
    sectorId: null,
    categoriaTarifaId: 1,
    numeroGuia: 'NG-001',
    fechaInicio: new Date('2024-01-01'),
    direccionSuministro: 'Calle 1',
    estado: 'ACTIVO',
    creadoPor: null,
    comunidadId: 1,
    deletedAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    cliente: {
      clienteId: BigInt(10),
      identificacion: '0912345678',
      nombres: 'Juan',
      apellidos: 'Pérez',
      razonSocial: null,
      email: 'juan@test.com',
      telefono: '0991234567',
      direccionDomicilio: 'Av. Principal',
    },
    comunidad: { comunidadId: 1, codigo: 'C1', nombre: 'Comunidad 1' },
    sector: null,
    categoriaTarifa: {
      categoriaTarifaId: 1,
      nombre: 'Tipo 1',
      descripcion: null,
      valorBase: 4,
      consumoMinimoMensual: 10,
      valorExcedenteM3: 0.4,
    },
    ...overrides,
  });

describe('GetConnectionRequestPdfDataUseCase', () => {
  let useCase: GetConnectionRequestPdfDataUseCase;

  const mockContractRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    executeTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetConnectionRequestPdfDataUseCase,
        { provide: ContractRepository, useValue: mockContractRepository },
      ],
    }).compile();

    useCase = module.get<GetConnectionRequestPdfDataUseCase>(GetConnectionRequestPdfDataUseCase);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when contract not found', async () => {
      mockContractRepository.findUnique.mockResolvedValue(null);
      await expect(useCase.execute(BigInt(1))).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when contract is deleted', async () => {
      mockContractRepository.findUnique.mockResolvedValue(
        makeContrato({ deletedAt: new Date() }),
      );
      await expect(useCase.execute(BigInt(1))).rejects.toThrow(NotFoundException);
    });

    it('should call repository with correct contratoId', async () => {
      mockContractRepository.findUnique.mockResolvedValue(makeContrato());
      await useCase.execute(BigInt(1));
      expect(mockContractRepository.findUnique).toHaveBeenCalledWith({ contratoId: BigInt(1) });
    });

    it('should return correct solicitud structure', async () => {
      mockContractRepository.findUnique.mockResolvedValue(makeContrato());
      const result = await useCase.execute(BigInt(1));

      expect(result.solicitud.numero).toBe('1');
      expect(result.solicitud.cliente.nombres).toBe('Juan');
      expect(result.solicitud.cliente.apellidos).toBe('Pérez');
      expect(result.solicitud.cliente.identificacion).toBe('0912345678');
      expect(result.solicitud.contrato.numeroGuia).toBe('NG-001');
      expect(result.solicitud.contrato.comunidad.nombre).toBe('Comunidad 1');
      expect(result.solicitud.contrato.sector).toBeNull();
      expect(result.solicitud.formaPago).toBe('CONTADO');
    });

    it('should set costoGuia=120 when tarifa nombre includes "1"', async () => {
      mockContractRepository.findUnique.mockResolvedValue(
        makeContrato({ categoriaTarifa: { categoriaTarifaId: 1, nombre: 'Tipo 1', descripcion: null, valorBase: 4, consumoMinimoMensual: 10, valorExcedenteM3: 0.4 } }),
      );
      const result = await useCase.execute(BigInt(1));
      expect(result.solicitud.costos.costoGuia).toBe(120);
      expect(result.solicitud.costos.total).toBe(123);
    });

    it('should set costoGuia=150 when tarifa nombre includes "2"', async () => {
      mockContractRepository.findUnique.mockResolvedValue(
        makeContrato({ categoriaTarifa: { categoriaTarifaId: 2, nombre: 'Tipo 2', descripcion: null, valorBase: 6, consumoMinimoMensual: 15, valorExcedenteM3: 0.5 } }),
      );
      const result = await useCase.execute(BigInt(1));
      expect(result.solicitud.costos.costoGuia).toBe(150);
      expect(result.solicitud.costos.total).toBe(153);
    });

    it('should set costoGuia=200 for unknown tarifa type', async () => {
      mockContractRepository.findUnique.mockResolvedValue(
        makeContrato({ categoriaTarifa: { categoriaTarifaId: 3, nombre: 'Tipo 3', descripcion: null, valorBase: 8, consumoMinimoMensual: 20, valorExcedenteM3: 0.6 } }),
      );
      const result = await useCase.execute(BigInt(1));
      expect(result.solicitud.costos.costoGuia).toBe(200);
      expect(result.solicitud.costos.total).toBe(203);
    });

    it('should include sector when present', async () => {
      mockContractRepository.findUnique.mockResolvedValue(
        makeContrato({ sector: { sectorId: 1, codigo: 'S1', nombre: 'Sector Norte' } }),
      );
      const result = await useCase.execute(BigInt(1));
      expect(result.solicitud.contrato.sector).toEqual({ nombre: 'Sector Norte' });
    });

    it('should map tarifa values from categoriaTarifa', async () => {
      mockContractRepository.findUnique.mockResolvedValue(makeContrato());
      const result = await useCase.execute(BigInt(1));
      expect(result.solicitud.tarifa.valorBase).toBe(4);
      expect(result.solicitud.tarifa.consumoMinimoMensual).toBe(10);
      expect(result.solicitud.tarifa.valorExcedenteM3).toBe(0.4);
    });
  });
});
