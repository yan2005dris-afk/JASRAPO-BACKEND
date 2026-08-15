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
    this.validateInvariants();
  }

  static create(props: Partial<ContractEntity>): ContractEntity {
    return new ContractEntity(props);
  }

  validateInvariants(): void {
    if (
      this.numeroGuia !== undefined &&
      this.numeroGuia !== null &&
      this.numeroGuia.trim() === ''
    ) {
      throw new Error('El número de guía no puede estar vacío');
    }

    if (
      this.direccionSuministro !== undefined &&
      this.direccionSuministro !== null &&
      this.direccionSuministro.trim() === ''
    ) {
      throw new Error('La dirección de suministro no puede estar vacía');
    }

    if (
      this.estado !== undefined &&
      this.estado !== null &&
      this.estado.trim() === ''
    ) {
      throw new Error('El estado del contrato no puede estar vacío');
    }
  }

  canTransitionTo(nuevoEstado: string): boolean {
    if (!this.estado) return true;
    const allowedTransitions: Record<string, string[]> = {
      SOLICITUD: [
        'PENDIENTE_PAGO',
        'PENDIENTE_INSTALACION',
        'ACTIVO',
        'RETIRADO',
      ],
      PENDIENTE_PAGO: ['PENDIENTE_INSTALACION', 'ACTIVO', 'RETIRADO'],
      PENDIENTE_INSTALACION: ['ACTIVO', 'RETIRADO'],
      ACTIVO: ['EN_MORA', 'ORDEN_CORTE', 'SUSPENDIDO', 'EN_CONVENIO', 'RETIRADO'],
      EN_MORA: [
        'ACTIVO',
        'ORDEN_CORTE',
        'SUSPENDIDO',
        'EN_CONVENIO',
        'RETIRADO',
      ],
      ORDEN_CORTE: ['SUSPENDIDO', 'RECONEXION', 'ACTIVO', 'RETIRADO'],
      SUSPENDIDO: ['RECONEXION', 'ACTIVO', 'RETIRADO'],
      EN_CONVENIO: ['ACTIVO', 'EN_MORA', 'RETIRADO'],
      RECONEXION: ['ACTIVO', 'RETIRADO'],
      RETIRADO: [],
    };
    const allowed = allowedTransitions[this.estado];
    if (!allowed) return true;
    return allowed.includes(nuevoEstado);
  }

  cambiarEstado(nuevoEstado: string): void {
    if (!nuevoEstado || nuevoEstado.trim() === '') {
      throw new Error('El nuevo estado no puede estar vacío');
    }
    if (this.estado && !this.canTransitionTo(nuevoEstado)) {
      throw new Error(
        `Transición de estado inválida de ${this.estado} a ${nuevoEstado}`,
      );
    }
    this.estado = nuevoEstado;
  }

  esActivo(): boolean {
    return this.estado === 'ACTIVO';
  }

  esValido(): boolean {
    return !this.deletedAt && this.esActivo();
  }
}
