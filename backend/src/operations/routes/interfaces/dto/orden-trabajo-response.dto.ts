import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OrdenTrabajoEntity } from '../../domain/entities/orden-trabajo.entity';
import { DateUtil } from 'src/shared/utils/date.util';

export class OrdenTrabajoContratoDto {
  @ApiProperty({ example: 'G-0001', description: 'Número de contrato/guía' })
  numeroContrato: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del cliente' })
  clienteNombre: string;

  @ApiProperty({
    example: 'Av. Amazonas 123',
    description: 'Dirección de suministro',
  })
  direccion: string;
}

export class OrdenTrabajoMedidorDto {
  @ApiProperty({
    example: 'SER-1234',
    description: 'Número de serie del medidor',
  })
  numeroSerie: string;
}

export class OrderWorkResponseDto {
  @ApiProperty({ example: '1', description: 'ID de la orden de trabajo' })
  ordenTrabajoId: string;

  @ApiProperty({ example: '1', description: 'ID de la ruta' })
  rutaId: string;

  @ApiProperty({ example: 'INSTALACION', description: 'Tipo de actividad' })
  tipoActividad: string;

  @ApiProperty({ example: 'PENDIENTE', description: 'Estado de la orden' })
  estado: string;

  @ApiProperty({ example: 1, description: 'Orden de visita' })
  ordenVisita: number;

  @ApiPropertyOptional({
    example: 'Instalación completada exitosamente',
    nullable: true,
    description: 'Resultado u observación',
  })
  resultadoObservacion?: string | null;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/evidencia.jpg',
    nullable: true,
    description: 'URL de evidencia fotográfica',
  })
  evidenciaFotoUrl?: string | null;

  @ApiPropertyOptional({
    example: '2026-08-19T15:30:00.000Z',
    nullable: true,
    description: 'Fecha y hora de completado',
  })
  completadoEn?: string | null;

  @ApiPropertyOptional({
    example: '100',
    nullable: true,
    description: 'ID de la lectura vinculada',
  })
  lecturaId?: string | null;

  @ApiPropertyOptional({
    type: OrdenTrabajoContratoDto,
    nullable: true,
    description:
      'Datos del contrato (null si la orden no tiene contrato asociado)',
  })
  contrato?: OrdenTrabajoContratoDto | null;

  @ApiPropertyOptional({
    type: OrdenTrabajoMedidorDto,
    nullable: true,
    description:
      'Datos del medidor (null si la orden no tiene medidor asociado)',
  })
  medidor?: OrdenTrabajoMedidorDto | null;

  static fromRow(entity: OrdenTrabajoEntity): OrderWorkResponseDto {
    const dto = new OrderWorkResponseDto();
    dto.ordenTrabajoId = entity.ordenTrabajoId.toString();
    dto.rutaId = entity.rutaId.toString();
    dto.tipoActividad = entity.tipoActividad;
    dto.estado = entity.estado;
    dto.ordenVisita = entity.ordenVisita;
    dto.resultadoObservacion = entity.resultadoObservacion;
    dto.evidenciaFotoUrl = entity.evidenciaFotoUrl;
    dto.completadoEn = entity.completadoEn
      ? typeof entity.completadoEn === 'string'
        ? entity.completadoEn
        : DateUtil.formatForFrontend(entity.completadoEn)
      : null;
    dto.lecturaId = entity.lecturaId?.toString() ?? null;

    dto.contrato = entity.contratoNumeroContrato
      ? {
          numeroContrato: entity.contratoNumeroContrato,
          clienteNombre: entity.contratoClienteNombre ?? '',
          direccion: entity.contratoDireccion ?? '',
        }
      : null;

    dto.medidor = entity.medidorNumeroSerie
      ? { numeroSerie: entity.medidorNumeroSerie }
      : null;

    return dto;
  }

  static fromRowList(entities: OrdenTrabajoEntity[]): OrderWorkResponseDto[] {
    return entities.map((e) => OrderWorkResponseDto.fromRow(e));
  }
}
