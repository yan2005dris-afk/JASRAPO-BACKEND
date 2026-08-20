export interface ContractTariffCategoryRef {
  categoriaTarifaId: number;
  nombre: string;
  descripcion: string | null;
  valorBase: number;
  consumoMinimoMensual: number | null;
  valorExcedenteM3: number | null;
}

export interface ContractClientRef {
  clienteId: bigint;
  identificacion: string;
  nombres: string;
  apellidos: string;
  razonSocial: string | null;
  email: string | null;
  telefono: string | null;
  direccionDomicilio: string | null;
}

export interface ContractCommunityRef {
  comunidadId: number;
  codigo: string;
  nombre: string;
}

export interface ContractSectorRef {
  sectorId: number;
  codigo: string;
  nombre: string;
}

export interface ContractMeterRef {
  medidorId: bigint;
  serie: string;
  marca: string;
  modelo: string;
}

export interface ContractApprovedReadingRef {
  lecturaId: bigint;
  fecha: Date;
  lecturaActual: number;
}

export interface ContractMeterHistoryRef {
  historialId: bigint;
  medidorId: bigint;
  fechaDesde: Date;
  fechaHasta: Date | null;
  lecturaInicial: number;
  lecturaFinal: number | null;
  medidor: ContractMeterRef;
  ultimaLecturaAprobada: ContractApprovedReadingRef | null;
}
