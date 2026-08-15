import { ApiProperty } from '@nestjs/swagger';
import type { LecturaEntity } from '../../domain/entities/lectura.entity';

export class ResponseReadingDto {
  @ApiProperty({ description: 'ID de la lectura' })
  lecturaId: string;

  @ApiProperty({ description: 'Fecha de la lectura' })
  fecha: Date;

  @ApiProperty({ description: 'Lectura anterior' })
  lecturaAnterior: number;

  @ApiProperty({ description: 'Lectura actual' })
  lecturaActual: number;

  @ApiProperty({ description: 'Consumo calculado' })
  consumoCalculado: number;

  @ApiProperty({ description: 'ID del contrato' })
  contratoId: string;

  @ApiProperty({ description: 'Descripción de anomalía', required: false })
  descripcionAnomalia: string | null;

  @ApiProperty({ description: 'Fecha de validación', required: false })
  fechaValidacion: Date | null;

  @ApiProperty({ description: 'URL de la foto', required: false })
  fotoUrl: string | null;

  @ApiProperty({ description: 'Indica si está validada' })
  isValidada: boolean;

  @ApiProperty({ description: 'Lectura inicial' })
  lecturaInicial: boolean;

  @ApiProperty({ description: 'ID del período' })
  periodoId: number;

  @ApiProperty({ description: 'Indica si tiene anomalía' })
  tieneAnomalia: boolean;

  @ApiProperty({ description: 'Estado de la lectura', example: 'PENDIENTE' })
  estado: string;

  @ApiProperty({ description: 'Contrato asociado', required: false })
  contrato?: {
    contratoId: string;
    numeroGuia: string;
    direccionSuministro: string;
    estado: string;
  } | null;

  @ApiProperty({ description: 'Medidor asociado', required: false })
  medidor?: {
    medidorId: string;
    serie: string;
    marca: string;
    modelo: string;
  } | null;

  @ApiProperty({ description: 'Período asociado', required: false })
  periodoRel?: {
    periodoId: number;
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
  } | null;

  constructor(partial: Partial<ResponseReadingDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(
    reading: LecturaEntity | null | undefined,
  ): ResponseReadingDto | null {
    if (!reading) return null;
    const activeContrato = reading.contrato;

    return new ResponseReadingDto({
      lecturaId: reading.lecturaId.toString(),
      fecha: reading.fecha,
      lecturaAnterior: reading.lecturaAnterior,
      lecturaActual: reading.lecturaActual,
      consumoCalculado: reading.consumoCalculado,
      contratoId: activeContrato ? activeContrato.contratoId.toString() : '',
      descripcionAnomalia: reading.descripcionAnomalia,
      fechaValidacion: reading.fechaValidacion,
      fotoUrl: reading.fotoUrl,
      isValidada: reading.isValidada,
      lecturaInicial: reading.lecturaInicial,
      periodoId: reading.periodoId,
      tieneAnomalia: reading.tieneAnomalia,
      estado: reading.estado,
      contrato: activeContrato
        ? {
            contratoId: activeContrato.contratoId.toString(),
            numeroGuia: activeContrato.numeroGuia,
            direccionSuministro: activeContrato.direccionSuministro,
            estado: activeContrato.estado,
          }
        : null,
      medidor: reading.medidor
        ? {
            medidorId: reading.medidor.medidorId.toString(),
            serie: reading.medidor.serie,
            marca: reading.medidor.marca,
            modelo: reading.medidor.modelo,
          }
        : null,
      periodoRel: reading.periodoRel
        ? {
            periodoId: reading.periodoRel.periodoId,
            nombre: reading.periodoRel.nombre,
            fechaInicio: reading.periodoRel.fechaInicio,
            fechaFin: reading.periodoRel.fechaFin,
          }
        : null,
    });
  }
}
