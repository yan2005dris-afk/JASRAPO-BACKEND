import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateContractUseCase } from './update-contract.use-case';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';
import {
  DomainValidationException,
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('UpdateContractUseCase', () => {
  let useCase: UpdateContractUseCase;

  const mockContractRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateContractUseCase,
        {
          provide: ContractRepository,
          useValue: mockContractRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateContractUseCase>(UpdateContractUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update contract service state only', async () => {
    const id = BigInt(1);
    const updateDto = { estadoServicio: 'ACTIVO' as const };

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({ contratoId: id, deletedAt: null }),
    );
    mockContractRepository.update.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        estadoServicio: 'ACTIVO',
      }),
    );

    const result = await useCase.execute(id, updateDto);

    expect(mockContractRepository.update).toHaveBeenCalledWith(id, {
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'AL_DIA',
    });
    expect(result).toMatchObject({ contratoId: id, estadoServicio: 'ACTIVO' });
  });

  it('should update multiple contract fields', async () => {
    const id = BigInt(1);
    const updateDto = {
      estadoServicio: 'ACTIVO' as const,
      direccionSuministro: 'Nueva Dir',
      sectorId: '4',
    };

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        deletedAt: null,
      }),
    );
    mockContractRepository.update.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        estadoServicio: 'ACTIVO',
        direccionSuministro: 'Nueva Dir',
        sectorId: 4,
      }),
    );

    const result = await useCase.execute(id, updateDto);

    expect(mockContractRepository.update).toHaveBeenCalledWith(id, {
      estadoServicio: 'ACTIVO',
      estadoCobranza: 'AL_DIA',
      direccionSuministro: 'Nueva Dir',
      sectorId: 4,
    });
    expect(result).toBeDefined();
  });

  it('should throw EntityNotFoundException if contract does not exist', async () => {
    const id = BigInt(999);
    mockContractRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(id, { estadoServicio: 'ACTIVO' }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('forwards coordinates when present', async () => {
    const id = BigInt(1);
    const updateDto = { latitud: -1.8021, longitud: -80.7554 };

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({ contratoId: id, deletedAt: null }),
    );
    mockContractRepository.update.mockResolvedValue(
      new ContractEntity({ contratoId: id }),
    );

    await useCase.execute(id, updateDto);

    expect(mockContractRepository.update).toHaveBeenCalledWith(id, {
      latitud: -1.8021,
      longitud: -80.7554,
    });
  });

  it('rejects new coordinates outside the service area without updating', async () => {
    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({
        contratoId: BigInt(1),
        deletedAt: null,
        latitud: -1.7982,
        longitud: -80.7582,
      }),
    );

    const result = useCase.execute(BigInt(1), {
      latitud: -1.8,
      longitud: -80.8,
    });

    await expect(result).rejects.toBeInstanceOf(DomainValidationException);
    await expect(result).rejects.toThrow(
      'La ubicación seleccionada está fuera del área de servicio de la Junta (parroquia Manglaralto)',
    );
    expect(mockContractRepository.update).not.toHaveBeenCalled();
  });

  it('keeps unchanged legacy coordinates outside the service area when editing other fields', async () => {
    const id = BigInt(1);

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        deletedAt: null,
        latitud: -1.8,
        longitud: -80.8,
      }),
    );
    mockContractRepository.update.mockResolvedValue(
      new ContractEntity({ contratoId: id }),
    );

    await useCase.execute(id, {
      direccionSuministro: 'Nueva Dir',
      latitud: -1.8,
      longitud: -80.8,
    });

    expect(mockContractRepository.update).toHaveBeenCalledWith(id, {
      direccionSuministro: 'Nueva Dir',
      latitud: -1.8,
      longitud: -80.8,
    });
  });

  it('clears coordinates when both are explicitly null', async () => {
    const id = BigInt(1);
    const updateDto = { latitud: null, longitud: null };

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({ contratoId: id, deletedAt: null }),
    );
    mockContractRepository.update.mockResolvedValue(
      new ContractEntity({ contratoId: id }),
    );

    await useCase.execute(id, updateDto);

    expect(mockContractRepository.update).toHaveBeenCalledWith(id, {
      latitud: null,
      longitud: null,
    });
  });

  it('does not send coordinates to the repository when omitted', async () => {
    const id = BigInt(1);
    const updateDto = { direccionSuministro: 'Nueva Dir' };

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({ contratoId: id, deletedAt: null }),
    );
    mockContractRepository.update.mockResolvedValue(
      new ContractEntity({ contratoId: id }),
    );

    await useCase.execute(id, updateDto);

    const sentData = mockContractRepository.update.mock.calls[0][1];
    expect(sentData).not.toHaveProperty('latitud');
    expect(sentData).not.toHaveProperty('longitud');
  });

  it('should throw InvalidDomainOperationException when updateData is empty', async () => {
    const id = BigInt(1);
    const updateDto = {};

    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({
        contratoId: id,
        deletedAt: null,
      }),
    );

    await expect(useCase.execute(id, updateDto)).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });
  it.each([
    'PENDIENTE_INSPECCION',
    'PENDIENTE_PAGO',
    'PENDIENTE_INSTALACION',
    'RECHAZADO',
  ] as const)(
    'cannot activate a contract in %s using a manual edit',
    async (estadoServicio) => {
      mockContractRepository.findById.mockResolvedValue(
        new ContractEntity({ contratoId: 1n, estadoServicio }),
      );
      await expect(
        useCase.execute(1n, { estadoServicio: 'ACTIVO' }),
      ).rejects.toThrow(InvalidDomainOperationException);
      expect(mockContractRepository.update).not.toHaveBeenCalled();
    },
  );
  it('does not rewrite lifecycle states when editing contract details', async () => {
    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({
        contratoId: 1n,
        estadoServicio: 'PENDIENTE_INSPECCION',
        estadoCobranza: 'NO_APLICA',
      }),
    );
    await useCase.execute(1n, {
      estadoServicio: 'PENDIENTE_INSPECCION',
      direccionSuministro: 'New address',
    });
    expect(mockContractRepository.update).toHaveBeenCalledWith(1n, {
      direccionSuministro: 'New address',
    });
  });
  it('allows editing observations without losing representative identity', async () => {
    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({
        contratoId: 1n,
        tramitadorEsTitular: false,
        tramitadorNombre: 'Ana',
        tramitadorIdentificacion: 'ABC',
        relacionTramitador: 'Familiar',
        registradoPorId: 7,
      }),
    );
    await useCase.execute(1n, { observacionesTramite: ' Updated ' });
    expect(mockContractRepository.update).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({
        tramitadorNombre: 'Ana',
        observacionesTramite: 'Updated',
      }),
    );
    expect(mockContractRepository.update.mock.calls[0][1]).not.toHaveProperty(
      'registradoPorId',
    );
  });
  it('allows adding notes to historical contracts without inventing who performed the procedure', async () => {
    mockContractRepository.findById.mockResolvedValue(
      new ContractEntity({ contratoId: 1n, tramitadorEsTitular: null }),
    );
    await useCase.execute(1n, { observacionesTramite: ' Note ' });
    expect(mockContractRepository.update).toHaveBeenCalledWith(1n, {
      observacionesTramite: 'Note',
    });
  });
});
