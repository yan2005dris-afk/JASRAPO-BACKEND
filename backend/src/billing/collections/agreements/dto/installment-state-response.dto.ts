import { ApiProperty } from '@nestjs/swagger';

export class InstallmentStateResponseDto {
  @ApiProperty({ example: 'PENDIENTE', description: 'Código del estado' })
  codigo: string;
}
