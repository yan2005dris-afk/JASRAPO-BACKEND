import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateBatchDto {
  @ApiProperty({ description: 'Billing period ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  periodoId: number;

  @ApiProperty({
    description:
      'Completed TOMA_LECTURA work route ID. The batch is generated from the readings of this route.',
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  rutaId: number;

  @ApiPropertyOptional({
    description: 'Billing month (1-12)',
    example: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mes?: number;

  @ApiPropertyOptional({
    description: 'Community ID (optional, if null bills everything)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
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
