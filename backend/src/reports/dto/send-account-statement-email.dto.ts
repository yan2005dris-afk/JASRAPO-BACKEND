import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';
import { SendReportEmailDto } from './send-report-email.dto';

/**
 * Body for `POST /reports/account-statement/email`. Requires `contratoId`.
 */
export class SendAccountStatementEmailDto extends SendReportEmailDto {
  @ApiProperty({ description: 'ID del contrato (BigInt como string)' })
  @IsNotEmptyString()
  contratoId!: string;
}
