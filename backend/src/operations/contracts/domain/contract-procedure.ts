import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';

export interface ContractProcedureData {
  tramitadorEsTitular?: boolean | null;
  tramitadorNombre?: string | null;
  tramitadorIdentificacion?: string | null;
  relacionTramitador?: string | null;
  observacionesTramite?: string | null;
  otrasNovedades?: string | null;
}

export function normalizeContractProcedure(
  input: ContractProcedureData,
): ContractProcedureData {
  const fields: ContractProcedureData = {};
  for (const key of [
    'tramitadorNombre',
    'tramitadorIdentificacion',
    'relacionTramitador',
    'observacionesTramite',
    'otrasNovedades',
  ] as const) {
    if (input[key] !== undefined) fields[key] = input[key]?.trim() || null;
  }
  if (input.tramitadorEsTitular !== undefined) {
    if (typeof input.tramitadorEsTitular !== 'boolean')
      throw new InvalidDomainOperationException(
        'Indique si quien tramita es el titular',
      );
    fields.tramitadorEsTitular = input.tramitadorEsTitular;
    if (input.tramitadorEsTitular) {
      fields.tramitadorNombre = null;
      fields.tramitadorIdentificacion = null;
      fields.relacionTramitador = null;
    } else if (
      !fields.tramitadorNombre ||
      !fields.tramitadorIdentificacion ||
      !fields.relacionTramitador
    ) {
      throw new InvalidDomainOperationException(
        'Ingrese nombre, identificaci\u00f3n y relaci\u00f3n con el titular de quien tramita',
      );
    }
  } else if (
    fields.tramitadorNombre ||
    fields.tramitadorIdentificacion ||
    fields.relacionTramitador
  ) {
    throw new InvalidDomainOperationException(
      'Indique si quien tramita es el titular',
    );
  }
  return fields;
}
