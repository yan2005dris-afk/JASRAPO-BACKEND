import { EstadoServicioContrato } from 'src/shared/enums';
import { ContractEntity } from '../../domain/entities/contract.entity';
import { ContractResponseDto } from './contract-response.dto';

describe('ContractResponseDto', () => {
  it('exposes separated states and omits the legacy state', () => {
    const entity = new ContractEntity({
      contratoId: 1n,
      clienteId: 10n,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'G-0001',
      fechaInicio: new Date(2026, 0, 1),
      direccionSuministro: 'Av. Amazonas 123',
      estadoServicio: EstadoServicioContrato.ACTIVO,
      estadoCobranza: 'AL_DIA',
      tieneConvenioActivo: true,
      creadoPor: null,
      comunidadId: 1,
      historialMedidores: null,
    });

    const response = ContractResponseDto.fromEntity(entity);

    expect(response).toMatchObject({
      estadoServicio: EstadoServicioContrato.ACTIVO,
      estadoCobranza: 'AL_DIA',
      tieneConvenioActivo: true,
    });
    expect(response).not.toHaveProperty('estado');
  });

  it('maps stored coordinates from the entity', () => {
    const entity = new ContractEntity({
      contratoId: 1n,
      clienteId: 10n,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'G-0001',
      fechaInicio: new Date(2026, 0, 1),
      direccionSuministro: 'Av. Amazonas 123',
      estadoServicio: EstadoServicioContrato.ACTIVO,
      estadoCobranza: 'AL_DIA',
      tieneConvenioActivo: false,
      creadoPor: null,
      comunidadId: 1,
      latitud: -1.8021,
      longitud: -80.7554,
      historialMedidores: null,
    });

    const response = ContractResponseDto.fromEntity(entity);

    expect(response.latitud).toBe(-1.8021);
    expect(response.longitud).toBe(-80.7554);
  });

  it('defaults coordinates to null when the entity has none', () => {
    const entity = new ContractEntity({
      contratoId: 1n,
      clienteId: 10n,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'G-0001',
      fechaInicio: new Date(2026, 0, 1),
      direccionSuministro: 'Av. Amazonas 123',
      estadoServicio: EstadoServicioContrato.ACTIVO,
      estadoCobranza: 'AL_DIA',
      tieneConvenioActivo: false,
      creadoPor: null,
      comunidadId: 1,
      latitud: null,
      longitud: null,
      historialMedidores: null,
    });

    const response = ContractResponseDto.fromEntity(entity);

    expect(response.latitud).toBeNull();
    expect(response.longitud).toBeNull();
  });
});
