import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';
import { SendReportEmailDto } from './send-report-email.dto';

/**
 * Body for `POST /reports/payment-agreement/email`. Requires `convenioId`.
 */
export class SendPaymentAgreementEmailDto extends SendReportEmailDto {
  @ApiProperty({ description: 'ID del convenio de pago (BigInt como string)' })
  @IsNotEmptyString()
  convenioId!: string;
}
