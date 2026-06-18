import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetResponsibilityAgreementPdfDataUseCase } from './get-responsibility-agreement-pdf-data.use-case';
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
    estado: 'ACTIVO',
    creadoPor: null,
    comunidadId: 1,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    cliente: {
      clienteId: BigInt(10),
      identificacion: '0912345678',
      nombres: 'Juan',
      apellidos: 'Pérez',
      razonSocial: null,
      email: null,
      telefono: null,
      direccionDomicilio: null,
    },
    ...overrides,
  });

describe('GetResponsibilityAgreementPdfDataUseCase', () => {
  let useCase: GetResponsibilityAgreementPdfDataUseCase;

  const mockContractRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetResponsibilityAgreementPdfDataUseCase,
        { provide: ContractRepository, useValue: mockContractRepository },
      ],
    }).compile();

    useCase = module.get<GetResponsibilityAgreementPdfDataUseCase>(
      GetResponsibilityAgreementPdfDataUseCase,
    );
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

    it('should return correct acta structure', async () => {
      mockContractRepository.findUnique.mockResolvedValue(makeContrato());
      const result = await useCase.execute(BigInt(1));

      expect(result.acta.cliente.nombres).toBe('Juan');
      expect(result.acta.cliente.apellidos).toBe('Pérez');
      expect(result.acta.cliente.identificacion).toBe('0912345678');
      expect(result.acta.cliente.razonSocial).toBeNull();
      expect(result.acta.fechaFirmado).toBeDefined();
      expect(typeof result.acta.fechaFirmado).toBe('string');
    });

    it('should include razonSocial when present', async () => {
      mockContractRepository.findUnique.mockResolvedValue(
        makeContrato({
          cliente: {
            clienteId: BigInt(10),
            identificacion: '1234567890001',
            nombres: '',
            apellidos: '',
            razonSocial: 'Empresa XYZ S.A.',
            email: null,
            telefono: null,
            direccionDomicilio: null,
          },
        }),
      );
      const result = await useCase.execute(BigInt(1));
      expect(result.acta.cliente.razonSocial).toBe('Empresa XYZ S.A.');
    });

    it('should use empty strings when cliente fields are missing', async () => {
      mockContractRepository.findUnique.mockResolvedValue(
        makeContrato({ cliente: null }),
      );
      const result = await useCase.execute(BigInt(1));
      expect(result.acta.cliente.nombres).toBe('');
      expect(result.acta.cliente.apellidos).toBe('');
      expect(result.acta.cliente.identificacion).toBe('');
    });
  });
});
