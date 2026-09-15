import { EstadoServicioContrato } from 'src/shared/enums';
import { ContractEntity } from '../../domain/entities/contract.entity';
import { ContractResponseDto } from './contract-response.dto';

describe('ContractResponseDto', () => {
  it('includes the service lifecycle state while preserving the legacy state', () => {
    const entity = new ContractEntity({
      contratoId: 1n,
      clienteId: 10n,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'G-0001',
      fechaInicio: new Date(2026, 0, 1),
      direccionSuministro: 'Av. Amazonas 123',
      estado: 'EN_CONVENIO',
      estadoServicio: EstadoServicioContrato.ACTIVO,
      creadoPor: null,
      comunidadId: 1,
      historialMedidores: null,
    });

    const response = ContractResponseDto.fromEntity(entity);

    expect(response).toMatchObject({
      estado: 'EN_CONVENIO',
      estadoServicio: EstadoServicioContrato.ACTIVO,
    });
  });
});
