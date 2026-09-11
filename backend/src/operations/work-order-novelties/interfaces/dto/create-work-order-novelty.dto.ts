import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { TipoAnomalia } from 'src/shared/enums';

export class CreateWorkOrderNoveltyDto {
  @ApiProperty({ description: 'ID de la orden de trabajo originadora' })
  @IsNotEmpty()
  @IsNumberString()
  ordenTrabajoId: string;

  @ApiPropertyOptional({ description: 'ID opcional de lectura como contexto' })
  @IsOptional()
  @IsNumberString()
  lecturaId?: string;

  @ApiProperty({ enum: TipoAnomalia, description: 'Tipo de novedad/anomalía' })
  @IsNotEmpty()
  @IsEnum(TipoAnomalia)
  tipo: TipoAnomalia;

  @ApiPropertyOptional({ description: 'Observación descriptiva de la novedad' })
  @IsOptional()
  @IsString()
  observacion?: string;
}
