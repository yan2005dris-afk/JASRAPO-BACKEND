import { ApiProperty } from '@nestjs/swagger';

export class AgreementStateResponseDto {
  @ApiProperty({ example: 'ACTIVO', description: 'Código del estado' })
  codigo: string;
}
