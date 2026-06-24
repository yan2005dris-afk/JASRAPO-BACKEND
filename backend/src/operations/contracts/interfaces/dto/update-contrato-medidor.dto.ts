import {
  IsNumberString,
  IsOptional,
  IsNumber,
  IsString,
  IsIn,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';
import { EstadoContrato } from 'src/shared/enums';

export class ActualizarContratoMedidorDto {
  @ApiPropertyOptional({
    description: 'Nuevo estado del contrato',
    enum: EstadoContrato,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(EstadoContrato))
  estado?: string;

  @ApiPropertyOptional({
    description: 'Nueva dirección de suministro',
    example: 'Calle Nueva 456',
  })
  @IsOptional()
  @IsString()
  @IsNotEmptyString()
  direccionSuministro?: string;

  @ApiPropertyOptional({
    description: 'ID de la nueva categoría de tarifa',
    example: '3',
  })
  @IsOptional()
  @IsNumberString()
  categoriaTarifaId?: string;

  @ApiPropertyOptional({
    description: 'ID de la nueva comunidad',
    example: '2',
  })
  @IsOptional()
  @IsNumberString()
  comunidadId?: string;

  @ApiPropertyOptional({ description: 'ID del nuevo sector', example: '4' })
  @IsOptional()
  @IsNumberString()
  sectorId?: string;

  @ApiPropertyOptional({
    description: 'ID del nuevo medidor (dispara reemplazo de medidor)',
    example: '200',
  })
  @IsOptional()
  @IsNumberString()
  medidorId?: string;

  @ApiPropertyOptional({
    description:
      'Lectura inicial del nuevo medidor (requerida si se cambia medidor)',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lecturaInicial?: number;
}
