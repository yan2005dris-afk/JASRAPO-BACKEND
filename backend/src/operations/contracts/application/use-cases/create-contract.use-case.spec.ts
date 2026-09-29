import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateContractUseCase } from './create-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { DomainValidationException } from 'src/shared/domain/exceptions/domain.exception';

describe('CreateContractUseCase', () => {
  let useCase: CreateContractUseCase;

  const mockContractRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    createContractWithMeterHistory: jest.fn(),
  };

  beforeEach(async () => {
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

    mockContractRepository.createContractWithMeterHistory.mockResolvedValue({
      contratoId: BigInt(1),
      estadoServicio: 'PENDIENTE_INSPECCION',
      estadoCobranza: 'NO_APLICA',
    });

    const result = await useCase.execute(dto);

    expect(
      mockContractRepository.createContractWithMeterHistory,
    ).toHaveBeenCalledWith({
      clienteId: BigInt(10),
      categoriaTarifaId: 3,
      medidorId: BigInt(200),
      comunidadId: 2,
      sectorId: null,
      numeroGuia: 'GUIA-001',
      direccionSuministro: 'Av. Principal 123',
      estadoServicio: 'PENDIENTE_INSPECCION',
      estadoCobranza: 'NO_APLICA',
      creadoPor: undefined,
      lecturaInicial: 0,
    });
    expect(result).toEqual({
      contratoId: BigInt(1),
      estadoServicio: 'PENDIENTE_INSPECCION',
      estadoCobranza: 'NO_APLICA',
    });
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
      estadoServicio: 'ACTIVO' as const,
      estadoCobranza: 'AL_DIA' as const,
    };

    mockContractRepository.createContractWithMeterHistory.mockResolvedValue({
      contratoId: BigInt(2),
      sector: { sectorId: 10, codigo: 'SEC-A', nombre: 'Sector A' },
    });

    const result = await useCase.execute(dto);

    expect(
      mockContractRepository.createContractWithMeterHistory,
    ).toHaveBeenCalledWith({
      clienteId: BigInt(20),
      categoriaTarifaId: 5,
      medidorId: BigInt(300),
      comunidadId: 3,
      sectorId: 10,
      numeroGuia: 'GUIA-002',
      direccionSuministro: 'Calle Secundaria 456',
      estadoServicio: 'PENDIENTE_INSPECCION',
      estadoCobranza: 'NO_APLICA',
      creadoPor: 'admin',
      lecturaInicial: 500,
    });
    expect(result).toEqual({
      contratoId: BigInt(2),
      sector: { sectorId: 10, codigo: 'SEC-A', nombre: 'Sector A' },
    });
  });

  it('cannot bypass inspection through explicit creation states', async () => {
    const dto = {
      clienteId: '20',
      categoriaTarifaId: '5',
      medidorId: '300',
      numeroGuia: 'GUIA-EXPLICIT',
      direccionSuministro: 'Calle Secundaria 456',
      comunidadId: '3',
      estadoServicio: 'ACTIVO' as const,
      estadoCobranza: 'AL_DIA' as const,
    };

    mockContractRepository.createContractWithMeterHistory.mockResolvedValue({});

    await useCase.execute(dto);

    expect(
      mockContractRepository.createContractWithMeterHistory,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        estadoServicio: 'PENDIENTE_INSPECCION',
        estadoCobranza: 'NO_APLICA',
      }),
    );
  });

  it('forwards coordinates to the command when present', async () => {
    const dto = {
      clienteId: '10',
      categoriaTarifaId: '3',
      medidorId: '200',
      numeroGuia: 'GUIA-COORDS',
      direccionSuministro: 'Av. Principal 123',
      comunidadId: '2',
      latitud: -1.8021,
      longitud: -80.7554,
    };

    mockContractRepository.createContractWithMeterHistory.mockResolvedValue({
      contratoId: BigInt(1),
    });

    await useCase.execute(dto);

    expect(
      mockContractRepository.createContractWithMeterHistory,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        latitud: -1.8021,
        longitud: -80.7554,
      }),
    );
  });

  it('rejects coordinates outside the service area without persisting', async () => {
    const dto = {
      clienteId: '10',
      categoriaTarifaId: '3',
      medidorId: '200',
      numeroGuia: 'GUIA-OUTSIDE',
      direccionSuministro: 'Av. Principal 123',
      comunidadId: '2',
      latitud: -1.8,
      longitud: -80.8,
    };

    const result = useCase.execute(dto);

    await expect(result).rejects.toBeInstanceOf(DomainValidationException);
    await expect(result).rejects.toThrow(
      'La ubicación seleccionada está fuera del área de servicio de la Junta (parroquia Manglaralto)',
    );
    expect(
      mockContractRepository.createContractWithMeterHistory,
    ).not.toHaveBeenCalled();
  });

  it('allows creating a contract with null coordinates', async () => {
    const dto = {
      clienteId: '10',
      categoriaTarifaId: '3',
      medidorId: '200',
      numeroGuia: 'GUIA-NULL',
      direccionSuministro: 'Av. Principal 123',
      comunidadId: '2',
      latitud: null,
      longitud: null,
    };

    mockContractRepository.createContractWithMeterHistory.mockResolvedValue({
      contratoId: BigInt(1),
    });

    await useCase.execute(dto);

    expect(
      mockContractRepository.createContractWithMeterHistory,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ latitud: null, longitud: null }),
    );
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

    mockContractRepository.createContractWithMeterHistory.mockRejectedValue(
      new NotFoundException(`Cliente con ID ${dto.clienteId} no encontrado`),
    );

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

    mockContractRepository.createContractWithMeterHistory.mockRejectedValue(
      new NotFoundException(`Medidor con ID ${dto.medidorId} no encontrado`),
    );

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

    mockContractRepository.createContractWithMeterHistory.mockRejectedValue(
      new NotFoundException(
        `Categoría de tarifa con ID ${dto.categoriaTarifaId} no encontrada`,
      ),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when comunidad does not exist', async () => {
    const dto = {
      clienteId: '10',
      categoriaTarifaId: '3',
      medidorId: '200',
      numeroGuia: 'GUIA-006',
      direccionSuministro: 'Dir',
      comunidadId: '999',
    };

    mockContractRepository.createContractWithMeterHistory.mockRejectedValue(
      new NotFoundException(
        `Comunidad con ID ${dto.comunidadId} no encontrada`,
      ),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when sector does not exist (S1.6)', async () => {
    const dto = {
      clienteId: '10',
      categoriaTarifaId: '3',
      medidorId: '200',
      numeroGuia: 'GUIA-007',
      direccionSuministro: 'Dir',
      comunidadId: '1',
      sectorId: '999',
    };

    mockContractRepository.createContractWithMeterHistory.mockRejectedValue(
      new NotFoundException(`Sector con ID ${dto.sectorId} no encontrado`),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });
});
