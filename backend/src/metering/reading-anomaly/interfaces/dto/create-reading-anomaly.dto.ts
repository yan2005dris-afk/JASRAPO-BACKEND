import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoAnomalia, EstadoAnomalia } from 'src/generated/prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class CreateReadingAnomalyDto {
  @ApiProperty({
    description: 'ID de la lectura asociada',
    example: '1',
  })
  @IsNotEmpty()
  lecturaId: string | number;

  @ApiPropertyOptional({
    description: 'Observación o descripción de la anomalía',
    example: 'Fuga de agua en el medidor',
  })
  @IsOptional()
  @IsString()
  @IsNotEmptyString()
  observacion?: string;

  @ApiProperty({
    description: 'Tipo de anomalía',
    enum: TipoAnomalia,
    example: 'FUGA',
  })
  @IsNotEmpty()
  @IsEnum(TipoAnomalia)
  tipo: TipoAnomalia;

  @ApiProperty({
    description: 'Estado de la anomalía',
    enum: EstadoAnomalia,
    example: 'PENDIENTE',
  })
  @IsNotEmpty()
  @IsEnum(EstadoAnomalia)
  estado: EstadoAnomalia;
}
