import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class GenerateBatchDto {
  @ApiProperty({ description: 'Billing period ID', example: 1 })
  @IsInt()
  periodoId: number;

  @ApiProperty({
    description: 'Community ID (optional, if null bills everything)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  comunidadId?: number;

  @ApiProperty({
    description: 'User who generates the batch',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  creadoPor?: string;
}
