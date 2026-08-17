import { ApiProperty } from '@nestjs/swagger';
import { EstadoPeriodo } from 'src/generated/prisma/enums';
import type { PeriodEntity } from '../../domain/entities/period.entity';
import { DateUtil } from 'src/shared/utils/date.util';

export class PeriodResponseDto {
  @ApiProperty({ example: 1, description: 'ID del periodo' })
  periodoId: number;

  @ApiProperty({
    example: '2026-01',
    description: 'Nombre o código identificador del periodo',
  })
  nombre: string;

  @ApiProperty({
    example: '2026-01-01',
    description: 'Fecha de inicio del periodo',
  })
  fechaInicio: string;

  @ApiProperty({
    example: '2026-01-31',
    description: 'Fecha de fin del periodo',
  })
  fechaFin: string;

  @ApiProperty({
    example: '2026-02-15',
    description: 'Fecha de vencimiento del periodo',
  })
  fechaVencimiento: string;

  @ApiProperty({
    enum: EstadoPeriodo,
    example: EstadoPeriodo.ABIERTO,
    description: 'Estado del periodo',
  })
  estado: EstadoPeriodo;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;

  static fromEntity(entity: PeriodEntity): PeriodResponseDto {
    const dto = new PeriodResponseDto();
    dto.periodoId = entity.periodoId;
    dto.nombre = entity.nombre;
    dto.fechaInicio =
      DateUtil.formatForFrontend(entity.fechaInicio) ??
      entity.fechaInicio.toISOString().split('T')[0];
    dto.fechaFin =
      DateUtil.formatForFrontend(entity.fechaFin) ??
      entity.fechaFin.toISOString().split('T')[0];
    dto.fechaVencimiento =
      DateUtil.formatForFrontend(entity.fechaVencimiento) ??
      entity.fechaVencimiento.toISOString().split('T')[0];
    dto.estado = entity.estado;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntityList(entities: PeriodEntity[]): PeriodResponseDto[] {
    return entities.map((entity) => PeriodResponseDto.fromEntity(entity));
  }
}
