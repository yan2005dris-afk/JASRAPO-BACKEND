import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ContractRow } from '../../infrastructure/repositories/contract.include';
import { DateUtil } from 'src/shared/utils/date.util';
import {
  EstadoServicioContrato,
  type EstadoServicioContrato as EstadoServicioContratoType,
  EstadoCobranzaContrato,
  type EstadoCobranzaContrato as EstadoCobranzaContratoType,
} from 'src/shared/enums';

export class ContractCategoriaTarifaDto {
  @ApiProperty({ example: 1 })
  categoriaTarifaId: number;

  @ApiProperty({ example: 'Residencial' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Tarifa básica residencial', nullable: true })
  descripcion: string | null;
}

export class ContractClienteDto {
  @ApiProperty({ example: '10' })
  clienteId: bigint;

  @ApiProperty({ example: '1712345678' })
  identificacion: string;

  @ApiProperty({ example: 'Juan' })
  nombres: string;

  @ApiProperty({ example: 'Pérez' })
  apellidos: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  razonSocial: string | null;

  @ApiPropertyOptional({ example: 'juan@example.com', nullable: true })
  email: string | null;

  @ApiPropertyOptional({ example: '0991234567', nullable: true })
  telefono: string | null;

  @ApiPropertyOptional({ example: 'Av. Principal 123', nullable: true })
  direccionDomicilio: string | null;
}

export class ContractComunidadDto {
  @ApiProperty({ example: 1 })
  comunidadId: number;

  @ApiProperty({ example: 'COM-001' })
  codigo: string;

  @ApiProperty({ example: 'San José' })
  nombre: string;
}

export class ContractSectorDto {
  @ApiProperty({ example: 1 })
  sectorId: number;

  @ApiProperty({ example: 'SEC-001' })
  codigo: string;

  @ApiProperty({ example: 'Centro' })
  nombre: string;
}

export class ContractMedidorDetalleDto {
  @ApiProperty({ example: '10' })
  medidorId: bigint;

  @ApiProperty({ example: 'MED-12345' })
  serie: string;

  @ApiProperty({ example: 'Elster' })
  marca: string;

  @ApiProperty({ example: 'V200' })
  modelo: string;
}

export class ContractApprovedReadingDto {
  @ApiProperty({ example: '101' })
  lecturaId: bigint;

  @ApiProperty({ example: '2026-08-19' })
  fecha: string;

  @ApiProperty({ example: 530 })
  lecturaActual: number;

  @ApiProperty({ example: 500 })
  lecturaAnterior: number;
}

export class ContractHistorialMedidorDto {
  @ApiProperty({ example: '1' })
  historialId: bigint;

  @ApiProperty({ example: '10' })
  medidorId: bigint;

  @ApiProperty({ example: '2026-01-01' })
  fechaDesde: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  fechaHasta: string | null;

  @ApiProperty({ example: 0 })
  lecturaInicial: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  lecturaFinal: number | null;

  @ApiPropertyOptional({ type: ContractApprovedReadingDto, nullable: true })
  ultimaLecturaAprobada: ContractApprovedReadingDto | null;

  @ApiProperty({ type: ContractMedidorDetalleDto })
  medidor: ContractMedidorDetalleDto;
}

export class ContractResponseDto {
  @ApiPropertyOptional({ type: Boolean, nullable: true })
  tramitadorEsTitular: boolean | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  tramitadorNombre: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  tramitadorIdentificacion: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  relacionTramitador: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  observacionesTramite: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  otrasNovedades: string | null;
  @ApiPropertyOptional({ type: Number, nullable: true })
  registradoPorId: number | null;

  @ApiProperty({ example: '1', description: 'ID del contrato' })
  contratoId: bigint;

  @ApiProperty({ example: '10', description: 'ID del cliente' })
  clienteId: bigint;

  @ApiPropertyOptional({
    example: 1,
    nullable: true,
    description: 'ID del sector',
  })
  sectorId: number | null;

  @ApiProperty({ example: 1, description: 'ID de la categoría de tarifa' })
  categoriaTarifaId: number;

  @ApiProperty({ example: 'G-0001', description: 'Número de guía' })
  numeroGuia: string;

  @ApiProperty({ example: '2026-01-01', description: 'Fecha de inicio' })
  fechaInicio: string;

  @ApiProperty({
    example: 'Av. Amazonas 123',
    description: 'Dirección de suministro',
  })
  direccionSuministro: string;

  @ApiProperty({
    enum: EstadoServicioContrato,
    example: EstadoServicioContrato.ACTIVO,
    description: 'Estado del ciclo de vida del servicio',
  })
  estadoServicio: EstadoServicioContratoType;

  @ApiProperty({
    enum: EstadoCobranzaContrato,
    example: EstadoCobranzaContrato.AL_DIA,
    description: 'Estado de cobranza de la deuda del servicio corriente',
  })
  estadoCobranza: EstadoCobranzaContratoType;

  @ApiProperty({
    example: false,
    description: 'Indica si existe un convenio activo derivado de Convenios',
  })
  tieneConvenioActivo: boolean;

  @ApiPropertyOptional({
    example: 'admin',
    nullable: true,
    description: 'Usuario creador',
  })
  creadoPor: string | null;

  @ApiProperty({ example: 1, description: 'ID de la comunidad' })
  comunidadId: number;

  @ApiPropertyOptional({
    example: -1.7966,
    nullable: true,
    description: 'Latitud del predio (grados decimales, WGS84)',
  })
  latitud: number | null;

  @ApiPropertyOptional({
    example: -80.7568,
    nullable: true,
    description: 'Longitud del predio (grados decimales, WGS84)',
  })
  longitud: number | null;

  @ApiPropertyOptional({ type: ContractCategoriaTarifaDto, nullable: true })
  categoriaTarifa?: ContractCategoriaTarifaDto | null;

  @ApiPropertyOptional({ type: ContractClienteDto, nullable: true })
  cliente?: ContractClienteDto | null;

  @ApiPropertyOptional({ type: ContractComunidadDto, nullable: true })
  comunidad?: ContractComunidadDto | null;

  @ApiPropertyOptional({ type: ContractSectorDto, nullable: true })
  sector?: ContractSectorDto | null;

  @ApiPropertyOptional({ type: [ContractHistorialMedidorDto], nullable: true })
  historialMedidores?: ContractHistorialMedidorDto[] | null;

  static fromRow(entity: ContractRow): ContractResponseDto {
    const dto = new ContractResponseDto();
    dto.contratoId = entity.contratoId;
    dto.clienteId = entity.clienteId;
    dto.sectorId = entity.sectorId ?? null;
    dto.categoriaTarifaId = entity.categoriaTarifaId;
    dto.numeroGuia = entity.numeroGuia;
    dto.fechaInicio = DateUtil.formatForFrontend(entity.fechaInicio) ?? '';
    dto.direccionSuministro = entity.direccionSuministro;
    dto.estadoServicio = entity.estadoServicio;
    dto.tramitadorEsTitular = entity.tramitadorEsTitular ?? null;
    dto.tramitadorNombre = entity.tramitadorNombre ?? null;
    dto.tramitadorIdentificacion = entity.tramitadorIdentificacion ?? null;
    dto.relacionTramitador = entity.relacionTramitador ?? null;
    dto.observacionesTramite = entity.observacionesTramite ?? null;
    dto.otrasNovedades = entity.otrasNovedades ?? null;
    dto.registradoPorId = entity.registradoPorId ?? null;

    dto.estadoCobranza = entity.estadoCobranza;
    dto.tieneConvenioActivo = (entity.convenios?.length ?? 0) > 0;
    dto.creadoPor = entity.creadoPor ?? null;
    dto.comunidadId = entity.comunidadId;
    dto.latitud =
      entity.latitud !== null && entity.latitud !== undefined
        ? Number(entity.latitud)
        : null;
    dto.longitud =
      entity.longitud !== null && entity.longitud !== undefined
        ? Number(entity.longitud)
        : null;
    dto.categoriaTarifa = entity.categoriaTarifa
      ? {
          categoriaTarifaId: entity.categoriaTarifa.categoriaTarifaId,
          nombre: entity.categoriaTarifa.nombre,
          descripcion: entity.categoriaTarifa.descripcion,
        }
      : null;
    dto.cliente = entity.cliente
      ? {
          clienteId: entity.cliente.clienteId,
          identificacion: entity.cliente.identificacion,
          nombres: entity.cliente.nombres,
          apellidos: entity.cliente.apellidos,
          razonSocial: entity.cliente.razonSocial,
          email: entity.cliente.email,
          telefono: entity.cliente.telefono,
          direccionDomicilio: entity.cliente.direccionDomicilio,
        }
      : null;
    dto.comunidad = entity.comunidad
      ? {
          comunidadId: entity.comunidad.comunidadId,
          codigo: entity.comunidad.codigo,
          nombre: entity.comunidad.nombre,
        }
      : null;
    dto.sector = entity.sector
      ? {
          sectorId: entity.sector.sectorId,
          codigo: entity.sector.codigo,
          nombre: entity.sector.nombre,
        }
      : null;
    dto.historialMedidores = entity.historialMedidores
      ? entity.historialMedidores.map((h) => {
          const ultimaLectura =
            h.fechaHasta === null &&
            h.medidor.lecturas?.[0] &&
            h.medidor.lecturas[0].fecha >= h.fechaDesde
              ? h.medidor.lecturas[0]
              : null;
          return {
            historialId: h.historialId,
            medidorId: h.medidorId,
            fechaDesde: DateUtil.formatForFrontend(h.fechaDesde) ?? '',
            fechaHasta: DateUtil.formatForFrontend(h.fechaHasta),
            lecturaInicial: Number(h.lecturaInicial),
            lecturaFinal:
              h.lecturaFinal !== null && h.lecturaFinal !== undefined
                ? Number(h.lecturaFinal)
                : null,
            ultimaLecturaAprobada: ultimaLectura
              ? {
                  lecturaId: ultimaLectura.lecturaId,
                  fecha: DateUtil.formatForFrontend(ultimaLectura.fecha) ?? '',
                  lecturaActual: Number(ultimaLectura.lecturaActual),
                  lecturaAnterior: Number(ultimaLectura.lecturaAnterior),
                }
              : null,
            medidor: {
              medidorId: h.medidor.medidorId,
              serie: h.medidor.serie,
              marca: h.medidor.marca,
              modelo: h.medidor.modelo,
            },
          };
        })
      : null;
    return dto;
  }

  static fromRowList(entities: ContractRow[]): ContractResponseDto[] {
    return entities.map((e) => ContractResponseDto.fromRow(e));
  }
}
