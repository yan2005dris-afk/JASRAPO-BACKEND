import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetConnectionRequestPdfDataUseCase } from './get-connection-request-pdf-data.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';

const makeContrato = (
  overrides: Partial<ContractEntity> = {},
): ContractEntity =>
  new ContractEntity({
    contratoId: BigInt(1),
    clienteId: BigInt(10),
    sectorId: null,
    categoriaTarifaId: 1,
    numeroGuia: 'NG-001',
    fechaInicio: new Date('2024-01-01'),
    direccionSuministro: 'Calle 1',
    estadoServicio: 'ACTIVO',
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
    getConnectionCosts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetConnectionRequestPdfDataUseCase,
        { provide: ContractRepository, useValue: mockContractRepository },
      ],
    }).compile();

    useCase = module.get<GetConnectionRequestPdfDataUseCase>(
      GetConnectionRequestPdfDataUseCase,
    );

    mockContractRepository.getConnectionCosts.mockResolvedValue({
      costoGuia: 0,
      derechoInspeccion: 0,
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when contract not found', async () => {
      mockContractRepository.findUnique.mockResolvedValue(null);
      await expect(useCase.execute(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when contract is deleted', async () => {
      mockContractRepository.findUnique.mockResolvedValue(
        makeContrato({ deletedAt: new Date() }),
      );
      await expect(useCase.execute(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call repository with correct contratoId', async () => {
      mockContractRepository.findUnique.mockResolvedValue(makeContrato());
      await useCase.execute(BigInt(1));
      expect(mockContractRepository.findUnique).toHaveBeenCalledWith({
        contratoId: BigInt(1),
      });
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

    it('should source guía and inspección costs from rubros (by categoriaTarifaId)', async () => {
      mockContractRepository.findUnique.mockResolvedValue(makeContrato());
      mockContractRepository.getConnectionCosts.mockResolvedValue({
        costoGuia: 1,
        derechoInspeccion: 5,
      });

      const result = await useCase.execute(BigInt(1));

      expect(mockContractRepository.getConnectionCosts).toHaveBeenCalledWith(1);
      expect(result.solicitud.costos.costoGuia).toBe(1);
      expect(result.solicitud.costos.derechoInspeccion).toBe(5);
      expect(result.solicitud.costos.total).toBe(6);
    });

    it('should reflect a different tariff rule from rubros', async () => {
      mockContractRepository.findUnique.mockResolvedValue(
        makeContrato({
          categoriaTarifaId: 2,
          categoriaTarifa: {
            categoriaTarifaId: 2,
            nombre: 'Tipo 2',
            descripcion: null,
          },
        }),
      );
      mockContractRepository.getConnectionCosts.mockResolvedValue({
        costoGuia: 2,
        derechoInspeccion: 5,
      });

      const result = await useCase.execute(BigInt(1));

      expect(mockContractRepository.getConnectionCosts).toHaveBeenCalledWith(2);
      expect(result.solicitud.costos.costoGuia).toBe(2);
      expect(result.solicitud.costos.total).toBe(7);
    });

    it('should default missing rubro costs to 0', async () => {
      mockContractRepository.findUnique.mockResolvedValue(makeContrato());
      mockContractRepository.getConnectionCosts.mockResolvedValue({
        costoGuia: null,
        derechoInspeccion: null,
      });

      const result = await useCase.execute(BigInt(1));

      expect(result.solicitud.costos.costoGuia).toBe(0);
      expect(result.solicitud.costos.derechoInspeccion).toBe(0);
      expect(result.solicitud.costos.total).toBe(0);
    });

    it('should include sector when present', async () => {
      mockContractRepository.findUnique.mockResolvedValue(
        makeContrato({
          sector: { sectorId: 1, codigo: 'S1', nombre: 'Sector Norte' },
        }),
      );
      const result = await useCase.execute(BigInt(1));
      expect(result.solicitud.contrato.sector).toEqual({
        nombre: 'Sector Norte',
      });
    });

    it('should map tarifa values from categoriaTarifa', async () => {
      mockContractRepository.findUnique.mockResolvedValue(makeContrato());
      const result = await useCase.execute(BigInt(1));
      expect(result.solicitud.tarifa.nombre).toBe('Tipo 1');
    });
  });
});
