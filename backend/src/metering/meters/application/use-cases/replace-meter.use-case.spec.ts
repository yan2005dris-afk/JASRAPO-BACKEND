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
      mesOrigen: 8,
      solicitadoPorUsuarioId: 1,
      claveIdempotencia: '123e4567-e89b-42d3-a456-426614174000',
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
        mesOrigen: 8,
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
      solicitadoPorUsuarioId: 1,
      claveIdempotencia: '123e4567-e89b-42d3-a456-426614174001',
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
      solicitadoPorUsuarioId: 1,
      claveIdempotencia: '123e4567-e89b-42d3-a456-426614174002',
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
      responsabilidadDano: ResponsabilidadDano.JUNTA,
      tratamientoSaliente: TratamientoSaliente.COBRO_PARCIAL,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      periodoOrigenId: 1,
      solicitadoPorUsuarioId: 1,
      claveIdempotencia: '123e4567-e89b-42d3-a456-426614174003',
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

  it('should reject missing or non-subsequent cycle on deferred treatment', async () => {
    const inputNoDestino = {
      contratoId: BigInt(1),
      nuevoMedidorId: BigInt(2),
      lecturaFinalSaliente: 100,
      motivo: MotivoReemplazoMedidor.DANO,
      responsabilidadDano: ResponsabilidadDano.JUNTA,
      tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
      tratamientoEntrante: TratamientoEntrante.DIFERIR_SIGUIENTE_PERIODO,
      periodoOrigenId: 1,
      mesOrigen: 8,
      solicitadoPorUsuarioId: 1,
      claveIdempotencia: '123e4567-e89b-42d3-a456-426614174004',
    };

    await expect(useCase.execute(inputNoDestino)).rejects.toThrow(
      'El período y mes destino son obligatorios cuando se difiere el cobro del medidor entrante',
    );

    const inputPriorCycle = {
      ...inputNoDestino,
      periodoDestinoId: 1,
      mesDestino: 7, // Earlier month in same period
    };

    await expect(useCase.execute(inputPriorCycle)).rejects.toThrow(
      'El ciclo destino debe ser el ciclo mensual inmediatamente posterior al origen',
    );
  });

  it('should require a separate approval for exceptional treatments', async () => {
    mockMeterRepository.replaceMeter.mockResolvedValue({});

    await useCase.execute({
      contratoId: 1n,
      nuevoMedidorId: 2n,
      lecturaFinalSaliente: 100,
      motivo: MotivoReemplazoMedidor.MANTENIMIENTO_PREVENTIVO,
      responsabilidadDano: ResponsabilidadDano.NO_APLICA,
      tratamientoSaliente: TratamientoSaliente.EXONERADO,
      tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
      periodoOrigenId: 1,
      mesOrigen: 8,
      solicitadoPorUsuarioId: 10,
      autorizadoPorUsuarioId: 10,
      claveIdempotencia: '123e4567-e89b-42d3-a456-426614174005',
    });

    expect(mockMeterRepository.replaceMeter).toHaveBeenCalledWith(
      expect.objectContaining({
        requiereAprobacion: true,
        autorizadoPorUsuarioId: undefined,
      }),
    );
  });

  it('should reject irrelevant conditional fields', async () => {
    await expect(
      useCase.execute({
        contratoId: 1n,
        nuevoMedidorId: 2n,
        lecturaFinalSaliente: 100,
        motivo: MotivoReemplazoMedidor.MANTENIMIENTO_PREVENTIVO,
        responsabilidadDano: ResponsabilidadDano.NO_APLICA,
        tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
        tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
        porcentajeCobro: 50,
        periodoOrigenId: 1,
        mesOrigen: 8,
        solicitadoPorUsuarioId: 10,
        claveIdempotencia: '123e4567-e89b-42d3-a456-426614174006',
      }),
    ).rejects.toThrow('El porcentaje de cobro solo aplica a COBRO_PARCIAL');
  });
});
