import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentAgreementLegacyFilterDto {
  @ApiProperty({ description: 'ID del convenio', example: '1' })
  @IsNotEmpty()
  @IsString()
  convenioId: string;
}
