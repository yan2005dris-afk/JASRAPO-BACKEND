import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';
import { SendReportEmailDto } from './send-report-email.dto';

/**
 * Body for `POST /reports/payments-report/email`. Requires `clienteId`;
 * `destinatario` and `subject` are inherited as optional from the base DTO.
 */
export class SendPaymentsReportEmailDto extends SendReportEmailDto {
  @ApiProperty({ description: 'ID del cliente (BigInt como string)' })
  @IsNotEmptyString()
  clienteId!: string;
}
