export class ContractEntity {
  contratoId: bigint;
  clienteId: bigint;
  cargoInicialDiferido: boolean;
  sectorId: number | null;
  categoriaTarifaId: number;
  numeroGuia: string;
  fechaInicio: Date;
  direccionSuministro: string;
  estado: string;
  creadoPor: string | null;
  comunidadId: number;

  categoriaTarifa?: {
    categoriaTarifaId: number;
    nombre: string;
    descripcion: string | null;
    valorBase: number;
    consumoMinimoMensual: number | null;
    valorExcedenteM3: number | null;
  } | null;

  cliente?: {
    clienteId: bigint;
    identificacion: string;
    nombres: string;
    apellidos: string;
    razonSocial: string | null;
    email: string | null;
    telefono: string | null;
    direccionDomicilio: string | null;
  } | null;

  comunidad?: {
    comunidadId: number;
    codigo: string;
    nombre: string;
  } | null;

  sector?: {
    sectorId: number;
    codigo: string;
    nombre: string;
  } | null;

  historialMedidores?: Array<{
    historialId: bigint;
    medidorId: bigint;
    fechaDesde: Date;
    fechaHasta: Date | null;
    medidor: {
      medidorId: bigint;
      serie: string;
      marca: string;
      modelo: string;
    };
  }> | null;

  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ContractEntity>) {
    Object.assign(this, partial);
  }
}
