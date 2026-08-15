import { ApiProperty } from '@nestjs/swagger';

export class LecturaEntity {
  @ApiProperty({ example: '1', description: 'ID de la lectura' })
  lecturaId: bigint;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de la lectura',
  })
  fecha: Date;

  @ApiProperty({ example: 100, description: 'Lectura anterior registrada' })
  lecturaAnterior: number;

  @ApiProperty({ example: 150, description: 'Lectura actual registrada' })
  lecturaActual: number;

  @ApiProperty({ example: 50, description: 'Consumo calculado de agua' })
  consumoCalculado: number;

  @ApiProperty({ example: '1', description: 'ID del medidor asociado' })
  medidorId: bigint;

  @ApiProperty({
    example: 'Anomalía menor',
    description: 'Descripción de anomalía encontrada',
    nullable: true,
  })
  descripcionAnomalia: string | null;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de validación',
    nullable: true,
  })
  fechaValidacion: Date | null;

  @ApiProperty({
    example: 'http://storage/photo.jpg',
    description: 'URL de la foto',
    nullable: true,
  })
  fotoUrl: string | null;

  @ApiProperty({
    example: false,
    description: 'Indica si la lectura ha sido validada',
  })
  isValidada: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si es la lectura inicial de instalación',
  })
  lecturaInicial: boolean;

  @ApiProperty({ example: 1, description: 'ID del período de facturación' })
  periodoId: number;

  @ApiProperty({
    example: false,
    description: 'Indica si tiene alguna anomalía',
  })
  tieneAnomalia: boolean;

  @ApiProperty({ example: 'PENDIENTE', description: 'Estado de la lectura' })
  estado: string;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de actualización',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de eliminación lógica',
    nullable: true,
  })
  deletedAt: Date | null;

  // Relaciones opcionales del dominio
  contrato?: {
    contratoId: bigint;
    numeroGuia: string;
    direccionSuministro: string;
    estado: string;
  } | null;

  medidor?: {
    medidorId: bigint;
    serie: string;
    marca: string;
    modelo: string;
  } | null;

  periodoRel?: {
    periodoId: number;
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
  } | null;

  constructor(partial: Partial<LecturaEntity>) {
    Object.assign(this, partial);
    this.validateInvariants();
  }

  static create(props: Partial<LecturaEntity>): LecturaEntity {
    return new LecturaEntity(props);
  }

  validateInvariants(): void {
    if (
      this.lecturaActual !== undefined &&
      this.lecturaAnterior !== undefined &&
      this.lecturaActual !== null &&
      this.lecturaAnterior !== null
    ) {
      if (this.lecturaActual < this.lecturaAnterior) {
        throw new Error(
          'La lectura actual no puede ser menor a la lectura anterior',
        );
      }
      this.consumoCalculado = this.lecturaActual - this.lecturaAnterior;
    }

    if (this.tieneAnomalia) {
      if (!this.descripcionAnomalia || this.descripcionAnomalia.trim() === '') {
        throw new Error(
          'Debe proporcionar una descripción si la lectura tiene anomalía',
        );
      }
    }
  }

  calcularConsumo(): number {
    if (
      this.lecturaActual !== undefined &&
      this.lecturaAnterior !== undefined &&
      this.lecturaActual !== null &&
      this.lecturaAnterior !== null
    ) {
      if (this.lecturaActual < this.lecturaAnterior) {
        throw new Error(
          'La lectura actual no puede ser menor a la lectura anterior',
        );
      }
      this.consumoCalculado = this.lecturaActual - this.lecturaAnterior;
      return this.consumoCalculado;
    }
    return this.consumoCalculado ?? 0;
  }

  marcarAnomalia(descripcion: string): void {
    if (!descripcion || descripcion.trim() === '') {
      throw new Error('La descripción de la anomalía es requerida');
    }
    this.tieneAnomalia = true;
    this.descripcionAnomalia = descripcion.trim();
  }

  validarLectura(fechaValidacion: Date = new Date()): void {
    this.isValidada = true;
    this.estado = 'VALIDADA';
    this.fechaValidacion = fechaValidacion;
  }
}
