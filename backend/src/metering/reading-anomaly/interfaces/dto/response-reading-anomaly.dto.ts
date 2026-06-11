import { ApiProperty } from '@nestjs/swagger';
import { IResponseReadingAnomaly } from '../../types/IResponseReadingAnomaly';

export class ResponseReadingAnomalyDto implements IResponseReadingAnomaly {
  @ApiProperty({ description: 'ID de la anomalía' })
  anomaliaId: string;

  @ApiProperty({ description: 'ID de la lectura asociada' })
  lecturaId: string;

  @ApiProperty({ description: 'Observación de la anomalía', required: false })
  observacion: string | null;

  @ApiProperty({ description: 'Tipo de anomalía' })
  tipo: string;

  @ApiProperty({ description: 'Estado de la anomalía' })
  estado: string;

  @ApiProperty({ description: 'URL de la foto en MinIO', required: false })
  fotoUrlMinIo: string | null;

  @ApiProperty({ description: 'Lectura asociada', required: false })
  lectura?: {
    lecturaId: string;
    fecha: Date;
    lecturaActual: number;
    consumoCalculado: number;
  } | null;
}
