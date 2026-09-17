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
});
