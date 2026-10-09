import { EstadoServicioContrato } from 'src/shared/enums';
import { contractRow } from '../../__test-utils__/contract-row.factory';
import { ContractResponseDto } from './contract-response.dto';
import { Decimal } from 'decimal.js';

describe('ContractResponseDto', () => {
  it('exposes separated states and omits the legacy state', () => {
    const row = contractRow({
      contratoId: 1n,
      clienteId: 10n,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'G-0001',
      fechaInicio: new Date(2026, 0, 1),
      direccionSuministro: 'Av. Amazonas 123',
      estadoServicio: EstadoServicioContrato.ACTIVO,
      estadoCobranza: 'AL_DIA',
      convenios: [{ convenioId: 12n }] as never,
      creadoPor: null,
      comunidadId: 1,
      historialMedidores: null,
    });

    const response = ContractResponseDto.fromRow(row);

    expect(response).toMatchObject({
      estadoServicio: EstadoServicioContrato.ACTIVO,
      estadoCobranza: 'AL_DIA',
      tieneConvenioActivo: true,
    });
    expect(response).not.toHaveProperty('estado');
  });

  it('maps stored coordinates from the entity', () => {
    const row = contractRow({
      contratoId: 1n,
      clienteId: 10n,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'G-0001',
      fechaInicio: new Date(2026, 0, 1),
      direccionSuministro: 'Av. Amazonas 123',
      estadoServicio: EstadoServicioContrato.ACTIVO,
      estadoCobranza: 'AL_DIA',
      convenios: [],
      creadoPor: null,
      comunidadId: 1,
      latitud: new Decimal('-1.8021'),
      longitud: new Decimal('-80.7554'),
      historialMedidores: null,
    });

    const response = ContractResponseDto.fromRow(row);

    expect(response.latitud).toBe(-1.8021);
    expect(response.longitud).toBe(-80.7554);
  });

  it('defaults coordinates to null when the entity has none', () => {
    const row = contractRow({
      contratoId: 1n,
      clienteId: 10n,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'G-0001',
      fechaInicio: new Date(2026, 0, 1),
      direccionSuministro: 'Av. Amazonas 123',
      estadoServicio: EstadoServicioContrato.ACTIVO,
      estadoCobranza: 'AL_DIA',
      convenios: [],
      creadoPor: null,
      comunidadId: 1,
      latitud: null,
      longitud: null,
      historialMedidores: null,
    });

    const response = ContractResponseDto.fromRow(row);

    expect(response.latitud).toBeNull();
    expect(response.longitud).toBeNull();
  });
});
