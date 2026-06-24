import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PaymentAgreementLegacyFilterDto {
  @ApiProperty({ description: 'ID del convenio', example: '1' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[1-9]\d*$/, { message: 'convenioId must be a positive integer' })
  convenioId: string;
}
