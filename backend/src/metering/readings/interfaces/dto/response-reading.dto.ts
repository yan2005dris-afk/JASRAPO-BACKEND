import { ApiProperty } from '@nestjs/swagger';
import { IResponseReading } from '../../types/IResponseReading';

export class ResponseReadingDto implements IResponseReading {
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

  @ApiProperty({ description: 'URL de foto en MinIO', required: false })
  fotoUrlMinIo: string | null;

  @ApiProperty({ description: 'Indica si está validada' })
  isValidada: boolean;

  @ApiProperty({ description: 'Lectura inicial' })
  lecturaInicial: boolean;

  @ApiProperty({ description: 'ID del período' })
  periodoId: number;

  @ApiProperty({ description: 'Indica si tiene anomalía' })
  tieneAnomalia: boolean;

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
}
