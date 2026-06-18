export interface CreateContractWithMeterCommand {
  clienteId: bigint;
  categoriaTarifaId: number;
  medidorId: bigint;
  comunidadId: number;
  sectorId: number | null;
  numeroGuia: string;
  direccionSuministro: string;
  estado:
    | 'ACTIVO'
    | 'SOLICITUD'
    | 'PENDIENTE_PAGO'
    | 'PENDIENTE_INSTALACION'
    | 'EN_MORA'
    | 'ORDEN_CORTE'
    | 'SUSPENDIDO'
    | 'EN_CONVENIO'
    | 'RETIRADO'
    | 'RECONEXION';
  creadoPor?: string;
  lecturaInicial: number;
}
