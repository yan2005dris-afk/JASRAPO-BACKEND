import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

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
  @IsNotEmpty()
  @IsString()
  motivoRechazo?: string;
}
