import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, MaxLength, ValidateIf } from 'class-validator';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';

export enum PreInvoiceStateAction {
  APPROVE = 'APROBADA',
  REJECT = 'RECHAZADA',
  IN_REVIEW = 'EN_REVISION',
  VOID = 'ANULADA',
}

export class UpdatePreInvoiceStateDto {
  @ApiProperty({
    description: 'Action to perform on the pre-invoice',
    enum: PreInvoiceStateAction,
    example: PreInvoiceStateAction.APPROVE,
  })
  @IsEnum(PreInvoiceStateAction)
  action: PreInvoiceStateAction;

  @ApiPropertyOptional({
    description: 'Rejection reason (required if action is REJECT)',
    example: 'Incorrect reading',
  })
  @ValidateIf((o) => o.action === 'RECHAZADA')
  @IsNotEmptyString()
  @MaxLength(500)
  motivoRechazo?: string;
}
