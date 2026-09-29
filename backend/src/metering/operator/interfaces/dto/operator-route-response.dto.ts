import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OperatorRoute } from '../../domain/repositories/repository-types';

export class OperatorMeterDto {
  @ApiProperty({ description: 'ID del medidor', example: '42' })
  medidorId: string;

  @ApiProperty({ description: 'Serie del medidor', example: 'MED-001' })
  serie: string;
}

export class OperatorInfoDto {
  @ApiProperty({ description: 'ID del usuario', example: 10 })
  usuarioId: number;

  @ApiProperty({ description: 'Nombres del operario', example: 'Juan' })
  nombres: string;

  @ApiProperty({ description: 'Apellidos del operario', example: 'Pérez' })
  apellidos: string;
}

export class OperatorWorkOrderContractDto {
  @ApiProperty({ description: 'Número de contrato', example: 'GUIA-001' })
  numeroContrato: string;

  @ApiProperty({ description: 'Nombre del cliente', example: 'Juan Pérez' })
  clienteNombre: string;

  @ApiProperty({ description: 'Dirección del suministro' })
  direccion: string;

  @ApiPropertyOptional({
    description: 'Latitud del predio (WGS84)',
    example: -0.9677,
    nullable: true,
  })
  latitud?: number | null;

  @ApiPropertyOptional({
    description: 'Longitud del predio (WGS84)',
    example: -80.7089,
    nullable: true,
  })
  longitud?: number | null;
}

export class OperatorWorkOrderDto {
  @ApiProperty({ description: 'ID de la orden de trabajo', example: '100' })
  ordenTrabajoId: string;

  @ApiProperty({ description: 'ID de la ruta', example: '1' })
  rutaId: string;

  @ApiProperty({ description: 'Tipo de actividad', example: 'LECTURA' })
  tipoActividad: string;

  @ApiProperty({ description: 'Estado de la orden', example: 'PENDIENTE' })
  estado: string;

  @ApiProperty({ description: 'Orden de visita', example: 1 })
  ordenVisita: number;

  @ApiPropertyOptional({ description: 'Resultado u observación de campo' })
  resultadoObservacion?: string;

  @ApiPropertyOptional({ description: 'URL de la evidencia fotográfica' })
  evidenciaFotoUrl?: string;

  @ApiPropertyOptional({ description: 'Fecha de finalización' })
  completadoEn?: string;

  @ApiPropertyOptional({ description: 'ID de la lectura', example: '25' })
  lecturaId?: string;

  @ApiProperty({ type: () => OperatorWorkOrderContractDto })
  contrato: OperatorWorkOrderContractDto;

  @ApiPropertyOptional({ type: () => OperatorMeterDto, nullable: true })
  medidor?: OperatorMeterDto | null;
}

export class OperatorRouteStopDto {
  @ApiProperty({ description: 'ID de la orden de trabajo', example: '100' })
  ordenTrabajoId: string;

  @ApiProperty({ description: 'Latitud del punto', example: -0.9677 })
  latitud: number;

  @ApiProperty({ description: 'Longitud del punto', example: -80.7089 })
  longitud: number;

  @ApiPropertyOptional({ description: 'Serie del medidor', example: 'MED-001' })
  serie?: string;

  @ApiProperty({ description: 'Nombre completo del cliente' })
  clienteNombre: string;

  @ApiProperty({ description: 'Tipo de actividad', example: 'LECTURA' })
  tipoActividad: string;

  @ApiProperty({ description: 'Estado de la orden', example: 'PENDIENTE' })
  estado: string;

  @ApiPropertyOptional({ description: 'Dirección del suministro' })
  direccionSuministro?: string;
}

export class OperatorRouteResponseDto {
  @ApiProperty({ description: 'ID de la ruta', example: '1' })
  rutaId: string;

  @ApiProperty({ description: 'Tipo de ruta', example: 'INSTALACION' })
  tipoRuta: string;

  @ApiProperty({ description: 'Nombre de la ruta' })
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción de la ruta' })
  descripcion?: string;

  @ApiProperty({ description: 'Estado actual', example: 'PENDIENTE' })
  estado: string;

  @ApiProperty({ description: 'ID del operario asignado', example: 10 })
  operarioId: number;

  @ApiProperty({ description: 'ID de la comunidad', example: 5 })
  comunidadId: number;

  @ApiPropertyOptional({
    description: 'Nombre de la comunidad',
    example: 'Olón',
  })
  comunidadNombre?: string;

  @ApiPropertyOptional({ description: 'ID del sector', example: 3 })
  sectorId?: number;

  @ApiPropertyOptional({
    description: 'Nombre del sector',
    example: 'Sector 1',
  })
  sectorNombre?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio' })
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin' })
  fechaFin?: string;

  @ApiPropertyOptional({ type: () => OperatorMeterDto, nullable: true })
  medidor?: OperatorMeterDto | null;

  @ApiPropertyOptional({ type: () => OperatorInfoDto })
  operario?: OperatorInfoDto;

  @ApiProperty({ type: [OperatorWorkOrderDto] })
  ordenesTrabajo: OperatorWorkOrderDto[];

  @ApiProperty({ type: [OperatorRouteStopDto] })
  paradas: OperatorRouteStopDto[];

  constructor(partial: Partial<OperatorRouteResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(route: OperatorRoute): OperatorRouteResponseDto {
    const mapMeter = (meter: OperatorRoute['medidor']) =>
      meter
        ? {
            medidorId: meter.medidorId.toString(),
            serie: meter.serie,
          }
        : null;

    return new OperatorRouteResponseDto({
      rutaId: route.rutaId.toString(),
      tipoRuta: route.tipoRuta,
      nombre: route.nombre,
      descripcion: route.descripcion ?? undefined,
      estado: route.estado,
      operarioId: route.operarioId,
      comunidadId: route.comunidadId,
      comunidadNombre: route.comunidadNombre ?? undefined,
      sectorId: route.sectorId ?? undefined,
      sectorNombre: route.sectorNombre ?? undefined,
      fechaInicio: route.fechaInicio?.toISOString() ?? undefined,
      fechaFin: route.fechaFin?.toISOString() ?? undefined,
      medidor: mapMeter(route.medidor),
      operario: route.operario ?? undefined,
      ordenesTrabajo: route.ordenesTrabajo.map((order) => {
        const customer = order.contrato.cliente;
        return {
          ordenTrabajoId: order.ordenTrabajoId.toString(),
          rutaId: order.rutaId.toString(),
          tipoActividad: order.tipoActividad,
          estado: order.estado,
          ordenVisita: order.ordenVisita,
          resultadoObservacion: order.resultadoObservacion ?? undefined,
          evidenciaFotoUrl: order.evidenciaFotoUrl ?? undefined,
          completadoEn: order.completadoEn?.toISOString() ?? undefined,
          lecturaId: order.lecturaId?.toString(),
          contrato: {
            numeroContrato: order.contrato.numeroGuia,
            clienteNombre:
              customer.razonSocial?.trim() ||
              `${customer.nombres} ${customer.apellidos}`.trim(),
            direccion: order.contrato.direccionSuministro,
            latitud:
              order.contrato.latitud == null
                ? null
                : Number(order.contrato.latitud),
            longitud:
              order.contrato.longitud == null
                ? null
                : Number(order.contrato.longitud),
          },
          medidor: order.medidor
            ? {
                medidorId: order.medidor.medidorId.toString(),
                serie: order.medidor.serie,
              }
            : null,
        };
      }),
      paradas: route.paradas.map((stop) => ({
        ...stop,
        ordenTrabajoId: stop.ordenTrabajoId.toString(),
        direccionSuministro: stop.direccionSuministro,
      })),
    });
  }
}
