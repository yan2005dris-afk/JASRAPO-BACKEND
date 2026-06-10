import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InstallMeterDto {
  @ApiProperty({
    description: 'ID del contrato al cual se asociará el medidor',
    example: '1',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  contratoId: string;
}
