import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Decimal } from 'decimal.js';
import { ReplaceMeterUseCase } from './replace-meter.use-case';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import {
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoSaliente,
  TratamientoEntrante,
} from 'src/shared/enums';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('ReplaceMeterUseCase', () => {
  let useCase: ReplaceMeterUseCase;

  const mockMeterRepository = {
    replaceMeter: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        ReplaceMeterUseCase,
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<ReplaceMeterUseCase>(ReplaceMeterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should execute replace meter successfully', async () => {
    const input = {
      contratoId: BigInt(1),
      nuevoMedidorId: BigInt(2),
      lecturaFinalSaliente: 530,
      lecturaInicialEntrante: 0,
      motivo: MotivoReemplazoMedidor.DANO,
      responsabilidadDano: ResponsabilidadDano.JUNTA,
      tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      periodoOrigenId: 1,
    };

    const expectedResult = {
      reemplazo: {
        reemplazoId: BigInt(1),
        contratoId: BigInt(1),
        motivo: MotivoReemplazoMedidor.DANO,
      },
      historialSalienteId: BigInt(10),
      historialEntranteId: BigInt(11),
      consumoMedidoSaliente: new Decimal(30),
      consumoFacturableSaliente: new Decimal(30),
      consumoDiferidoEntrante: new Decimal(0),
    };

    mockMeterRepository.replaceMeter.mockResolvedValue(expectedResult);

    const result = await useCase.execute(input);

    expect(result).toEqual(expectedResult);
    expect(mockMeterRepository.replaceMeter).toHaveBeenCalledWith(
      expect.objectContaining({
        contratoId: BigInt(1),
        nuevoMedidorId: BigInt(2),
        lecturaFinalSaliente: new Decimal(530),
        lecturaInicialEntrante: new Decimal(0),
      }),
    );
  });

  it('should reject negative final reading on outgoing meter', async () => {
    const input = {
      contratoId: BigInt(1),
      nuevoMedidorId: BigInt(2),
      lecturaFinalSaliente: -10,
      motivo: MotivoReemplazoMedidor.DANO,
      tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      periodoOrigenId: 1,
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });

  it('should reject negative initial reading on incoming meter', async () => {
    const input = {
      contratoId: BigInt(1),
      nuevoMedidorId: BigInt(2),
      lecturaFinalSaliente: 100,
      lecturaInicialEntrante: -5,
      motivo: MotivoReemplazoMedidor.DANO,
      tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      periodoOrigenId: 1,
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });

  it('should reject invalid percentage on partial charge', async () => {
    const inputWithoutPct = {
      contratoId: BigInt(1),
      nuevoMedidorId: BigInt(2),
      lecturaFinalSaliente: 100,
      motivo: MotivoReemplazoMedidor.DANO,
      tratamientoSaliente: TratamientoSaliente.COBRO_PARCIAL,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      periodoOrigenId: 1,
    };

    await expect(useCase.execute(inputWithoutPct)).rejects.toThrow(
      'El porcentaje de cobro es obligatorio cuando el tratamiento es COBRO_PARCIAL',
    );

    const inputOutOfRange = {
      ...inputWithoutPct,
      porcentajeCobro: 150,
    };

    await expect(useCase.execute(inputOutOfRange)).rejects.toThrow(
      'El porcentaje de cobro parcial debe estar entre 1% y 100%',
    );
  });

  it('should reject missing or equal destination period on deferred treatment', async () => {
    const inputNoDestino = {
      contratoId: BigInt(1),
      nuevoMedidorId: BigInt(2),
      lecturaFinalSaliente: 100,
      motivo: MotivoReemplazoMedidor.DANO,
      tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
      tratamientoEntrante: TratamientoEntrante.DIFERIR_SIGUIENTE_PERIODO,
      periodoOrigenId: 1,
    };

    await expect(useCase.execute(inputNoDestino)).rejects.toThrow(
      'El período destino es obligatorio cuando se difiere el cobro del medidor entrante',
    );

    const inputSameDestino = {
      ...inputNoDestino,
      periodoDestinoId: 1,
    };

    await expect(useCase.execute(inputSameDestino)).rejects.toThrow(
      'El período destino no puede ser igual al período origen al diferir el cobro',
    );
  });
});
