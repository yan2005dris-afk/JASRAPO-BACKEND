import { ApiProperty } from '@nestjs/swagger';
import { IsIn, MaxLength } from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

/**
 * Estados a los que se puede cambiar un convenio mediante PATCH.
 * No todos los estados son válidos como destino manual:
 * - PAGADO: finaliza el convenio, marca todas las cuotas como pagadas
 * - ANULADO: soft-delete (equivalente a DELETE /:id)
 * - ACTIVO: aprueba el convenio y lo activa
 */
const ESTADOS_VALIDOS = ['PAGADO', 'ANULADO', 'ACTIVO'] as const;

export class UpdateAgreementDto {
  @ApiProperty({
    description: 'Nuevo estado del convenio',
    example: 'PAGADO',
    enum: ESTADOS_VALIDOS,
  })
  @IsNotEmptyString()
  @MaxLength(20)
  @IsIn(ESTADOS_VALIDOS, {
    message: 'Estado inválido. Valores permitidos: PAGADO, ANULADO, ACTIVO',
  })
  estado: string;
}
