import { OrderWorkResponseDto } from './orden-trabajo-response.dto';
import { ordenTrabajoRow } from 'src/operations/routes/__test-utils__/route-row.factory';

describe('OrderWorkResponseDto', () => {
  it('serializes bigint identifiers as API-safe strings', () => {
    const dto = OrderWorkResponseDto.fromRow(
      ordenTrabajoRow({
        ordenTrabajoId: 42n,
        rutaId: 8n,
        contratoId: 9n,
        medidorId: null,
        ordenVisita: 1,
        resultadoObservacion: null,
        evidenciaFotoUrl: null,
        completadoEn: new Date('2026-08-26T12:00:00.000Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        lecturaId: 13n,
      }),
    );

    expect(dto.ordenTrabajoId).toBe('42');
    expect(dto.rutaId).toBe('8');
    expect(dto.lecturaId).toBe('13');
    expect(() => JSON.stringify(dto)).not.toThrow();
  });
});
