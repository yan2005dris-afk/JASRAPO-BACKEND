import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ReplaceMeterDto } from './replace-meter.dto';
import {
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoEntrante,
  TratamientoSaliente,
} from 'src/shared/enums';

const baseRequest = {
  claveIdempotencia: '123e4567-e89b-42d3-a456-426614174000',
  contratoId: '1',
  nuevoMedidorId: '2',
  lecturaFinalSaliente: 100,
  motivo: MotivoReemplazoMedidor.DANO,
  responsabilidadDano: ResponsabilidadDano.JUNTA,
  tratamientoSaliente: TratamientoSaliente.COBRO_REAL,
  tratamientoEntrante: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
  periodoOrigenId: 1,
  mesOrigen: 8,
};

describe('ReplaceMeterDto', () => {
  it('requires detalleMotivo for OTRO', async () => {
    const dto = plainToInstance(ReplaceMeterDto, {
      ...baseRequest,
      motivo: MotivoReemplazoMedidor.OTRO,
      responsabilidadDano: ResponsabilidadDano.NO_APLICA,
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'detalleMotivo')).toBe(
      true,
    );
  });

  it('requires the configured 3/6 historical average window', async () => {
    const dto = plainToInstance(ReplaceMeterDto, {
      ...baseRequest,
      tratamientoSaliente: TratamientoSaliente.PROMEDIO_HISTORICO,
      ventanaPromedio: 4,
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'ventanaPromedio')).toBe(
      true,
    );
  });

  it('requires destination fields for deferred billing', async () => {
    const dto = plainToInstance(ReplaceMeterDto, {
      ...baseRequest,
      tratamientoEntrante: TratamientoEntrante.DIFERIR_SIGUIENTE_PERIODO,
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['periodoDestinoId', 'mesDestino']),
    );
  });
});
