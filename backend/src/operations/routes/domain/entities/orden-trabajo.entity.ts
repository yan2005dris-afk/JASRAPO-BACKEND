export interface OrdenTrabajoEntityProps {
  ordenTrabajoId: bigint;
  rutaId: bigint;
  contratoId: bigint;
  medidorId?: bigint | null;
  tipoActividad: string;
  estado: string;
  ordenVisita: number;
  resultadoObservacion?: string | null;
  evidenciaFotoUrl?: string | null;
  completadoEn?: Date | string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  lecturaId?: bigint | null;

  // Relations (flattened for query convenience)
  contratoNumeroContrato?: string | null;
  contratoClienteNombre?: string | null;
  contratoDireccion?: string | null;
  medidorNumeroSerie?: string | null;
  lecturaLecturaId?: bigint | null;
}

export class OrdenTrabajoEntity {
  ordenTrabajoId: bigint;
  rutaId: bigint;
  contratoId: bigint;
  medidorId: bigint | null;
  tipoActividad: string;
  estado: string;
  ordenVisita: number;
  resultadoObservacion: string | null;
  evidenciaFotoUrl: string | null;
  completadoEn: Date | string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  lecturaId: bigint | null;

  // Flattened relations for list queries
  contratoNumeroContrato: string | null;
  contratoClienteNombre: string | null;
  contratoDireccion: string | null;
  medidorNumeroSerie: string | null;
  lecturaLecturaId: bigint | null;

  constructor(props: OrdenTrabajoEntityProps) {
    this.ordenTrabajoId = props.ordenTrabajoId;
    this.rutaId = props.rutaId;
    this.contratoId = props.contratoId;
    this.medidorId = props.medidorId ?? null;
    this.tipoActividad = props.tipoActividad;
    this.estado = props.estado;
    this.ordenVisita = props.ordenVisita;
    this.resultadoObservacion = props.resultadoObservacion ?? null;
    this.evidenciaFotoUrl = props.evidenciaFotoUrl ?? null;
    this.completadoEn = props.completadoEn ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt ?? null;
    this.lecturaId = props.lecturaId ?? null;

    this.contratoNumeroContrato = props.contratoNumeroContrato ?? null;
    this.contratoClienteNombre = props.contratoClienteNombre ?? null;
    this.contratoDireccion = props.contratoDireccion ?? null;
    this.medidorNumeroSerie = props.medidorNumeroSerie ?? null;
    this.lecturaLecturaId = props.lecturaLecturaId ?? null;
  }
}
