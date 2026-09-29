import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { BaseReportFilterDto } from './base-report-filter.dto';

export class PaymentAgreementFilterDto extends BaseReportFilterDto {
  @ApiProperty({ description: 'ID del convenio', example: '1' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[1-9]\d*$/, { message: 'convenioId must be a positive integer' })
  convenioId: string;
}
