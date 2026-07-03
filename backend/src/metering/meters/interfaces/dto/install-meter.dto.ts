import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class InstallMeterDto {
  @ApiPropertyOptional({
    description: 'Lectura inicial al momento de la instalación',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lecturaInicial?: number;
}
