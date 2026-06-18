import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateContractUseCase } from './create-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';

describe('CreateContractUseCase', () => {
  let useCase: CreateContractUseCase;
  let mockTx: any;

  const mockContractRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    executeTransaction: jest.fn(),
  };

  beforeEach(async () => {
    mockTx = {
      clientes: { findUnique: jest.fn() },
      medidores: { findUnique: jest.fn() },
      categoriaTarifa: { findUnique: jest.fn() },
      contratos: {
        create: jest.fn(),
        update: jest.fn(),
      },
      historialMedidores: {
        create: jest.fn(),
        updateMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    mockContractRepository.executeTransaction.mockImplementation(
      (cb: any) => cb(mockTx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateContractUseCase,
        {
          provide: ContractRepository,
          useValue: mockContractRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateContractUseCase>(CreateContractUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a contract and initial meter link for mandatory fields (S1.1)', async () => {
    const dto = {
      clienteId: '10',
      categoriaTarifaId: '3',
      medidorId: '200',
      numeroGuia: 'GUIA-001',
      direccionSuministro: 'Av. Principal 123',
      comunidadId: '2',
    };

    mockTx.clientes.findUnique.mockResolvedValue({ clienteId: BigInt(10) });
    mockTx.medidores.findUnique.mockResolvedValue({ medidorId: BigInt(200) });
    mockTx.categoriaTarifa.findUnique.mockResolvedValue({
      categoriaTarifaId: 3,
    });
    mockTx.contratos.create.mockResolvedValue({ contratoId: BigInt(1) });
    mockTx.historialMedidores.create.mockResolvedValue({});
    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: BigInt(1),
      estado: 'SOLICITUD',
    });

    const result = await useCase.execute(dto);

    expect(mockTx.clientes.findUnique).toHaveBeenCalledWith({
      where: { clienteId: BigInt(10) },
    });
    expect(mockTx.medidores.findUnique).toHaveBeenCalledWith({
      where: { medidorId: BigInt(200) },
    });
    expect(mockTx.categoriaTarifa.findUnique).toHaveBeenCalledWith({
      where: { categoriaTarifaId: 3 },
    });
    expect(mockTx.contratos.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clienteId: BigInt(10),
        categoriaTarifaId: 3,
        numeroGuia: 'GUIA-001',
        direccionSuministro: 'Av. Principal 123',
        comunidadId: 2,
        estado: 'SOLICITUD',
      }),
    });
    expect(mockTx.historialMedidores.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        medidorId: BigInt(200),
        contratoId: BigInt(1),
        motivo: 'VINCULACION MANUAL',
      }),
    });
    expect(result).toEqual({ contratoId: BigInt(1), estado: 'SOLICITUD' });
  });

  it('should create contract with optional fields (S1.2)', async () => {
    const dto = {
      clienteId: '20',
      categoriaTarifaId: '5',
      medidorId: '300',
      numeroGuia: 'GUIA-002',
      direccionSuministro: 'Calle Secundaria 456',
      comunidadId: '3',
      sectorId: '10',
      lecturaInicial: 500,
      creadoPor: 'admin',
      estado: 'ACTIVO',
    };

    mockTx.clientes.findUnique.mockResolvedValue({ clienteId: BigInt(20) });
    mockTx.medidores.findUnique.mockResolvedValue({ medidorId: BigInt(300) });
    mockTx.categoriaTarifa.findUnique.mockResolvedValue({
      categoriaTarifaId: 5,
    });
    mockTx.contratos.create.mockResolvedValue({ contratoId: BigInt(2) });
    mockTx.historialMedidores.create.mockResolvedValue({});
    mockContractRepository.findUnique.mockResolvedValue({
      contratoId: BigInt(2),
      estado: 'ACTIVO',
      sector: { sectorId: 10, codigo: 'SEC-A', nombre: 'Sector A' },
    });

    const result = await useCase.execute(dto);

    expect(mockTx.contratos.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clienteId: BigInt(20),
        sectorId: 10,
        estado: 'ACTIVO',
        creadoPor: 'admin',
      }),
    });
    expect(mockTx.historialMedidores.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        medidorId: BigInt(300),
        contratoId: BigInt(2),
      }),
    });
    expect(result).toEqual({
      contratoId: BigInt(2),
      estado: 'ACTIVO',
      sector: { sectorId: 10, codigo: 'SEC-A', nombre: 'Sector A' },
    });
  });

  it('should throw NotFoundException when cliente does not exist (S1.4)', async () => {
    const dto = {
      clienteId: '999',
      categoriaTarifaId: '3',
      medidorId: '200',
      numeroGuia: 'GUIA-003',
      direccionSuministro: 'Dir',
      comunidadId: '1',
    };

    mockTx.clientes.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when medidor does not exist (S1.5)', async () => {
    const dto = {
      clienteId: '10',
      categoriaTarifaId: '3',
      medidorId: '999',
      numeroGuia: 'GUIA-004',
      direccionSuministro: 'Dir',
      comunidadId: '1',
    };

    mockTx.clientes.findUnique.mockResolvedValue({ clienteId: BigInt(10) });
    mockTx.medidores.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when categoriaTarifa does not exist', async () => {
    const dto = {
      clienteId: '10',
      categoriaTarifaId: '999',
      medidorId: '200',
      numeroGuia: 'GUIA-005',
      direccionSuministro: 'Dir',
      comunidadId: '1',
    };

    mockTx.clientes.findUnique.mockResolvedValue({ clienteId: BigInt(10) });
    mockTx.medidores.findUnique.mockResolvedValue({ medidorId: BigInt(200) });
    mockTx.categoriaTarifa.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });
});
