import { ContractProcedureDto } from './contract-procedure.dto';
import { IsNumberString, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';
import {
  EstadoCobranzaContrato,
  EstadoServicioContrato,
} from 'src/shared/enums';
import {
  IsContractLatitude,
  IsContractLongitude,
} from './contract-coordinates.decorator';

export class ActualizarContratoMedidorDto extends ContractProcedureDto {
  @ApiPropertyOptional({ enum: EstadoServicioContrato })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(EstadoServicioContrato))
  estadoServicio?: EstadoServicioContrato;

  @ApiPropertyOptional({ enum: EstadoCobranzaContrato })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(EstadoCobranzaContrato))
  estadoCobranza?: EstadoCobranzaContrato;

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

  @ApiPropertyOptional({
    description: 'ID del nuevo cliente',
    example: '10',
  })
  @IsOptional()
  @IsNumberString()
  clienteId?: string;

  @ApiPropertyOptional({ description: 'ID del nuevo sector', example: '4' })
  @IsOptional()
  @IsNumberString()
  sectorId?: string;

  @IsContractLatitude()
  latitud?: number | null;

  @IsContractLongitude()
  longitud?: number | null;
}
