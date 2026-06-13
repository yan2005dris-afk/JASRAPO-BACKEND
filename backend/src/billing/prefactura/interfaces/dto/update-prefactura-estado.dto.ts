import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum EstadoPrefacturaAction {
  APROBAR = 'APROBADA',
  RECHAZAR = 'RECHAZADA',
  EN_REVISION = 'EN_REVISION',
  ANULAR = 'ANULADA',
}

export class UpdatePrefacturaEstadoDto {
  @ApiProperty({
    description: 'Acción a realizar sobre la prefactura',
    enum: EstadoPrefacturaAction,
    example: EstadoPrefacturaAction.APROBAR,
  })
  @IsEnum(EstadoPrefacturaAction)
  accion: EstadoPrefacturaAction;

  @ApiPropertyOptional({
    description: 'Motivo de rechazo (requerido si la acción es RECHAZAR)',
    example: 'Lectura incorrecta',
  })
  @IsOptional()
  @IsString()
  motivoRechazo?: string;
}
