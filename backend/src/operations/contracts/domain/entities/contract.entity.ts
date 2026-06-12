export class ContractEntity {
  contratoId: bigint;
  clienteId: bigint;
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
  } | null;

  cliente?: {
    clienteId: bigint;
    identificacion: string;
    nombres: string;
    apellidos: string;
    razonSocial: string | null;
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
