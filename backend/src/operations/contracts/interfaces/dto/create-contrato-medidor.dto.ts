import { ContractProcedureDto } from './contract-procedure.dto';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsNumber,
  IsString,
  IsIn,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';
import {
  EstadoCobranzaContrato,
  EstadoServicioContrato,
} from 'src/shared/enums';
import {
  IsContractLatitude,
  IsContractLongitude,
} from './contract-coordinates.decorator';

export class CrearContratoMedidorDto extends ContractProcedureDto {
  @ApiProperty({ description: 'ID del cliente', example: '1' })
  @IsNotEmpty()
  @IsNumberString()
  clienteId: string;

  @ApiProperty({ description: 'ID de la categoría de tarifa', example: '2' })
  @IsNotEmpty()
  @IsNumberString()
  categoriaTarifaId: string;

  @ApiProperty({ description: 'ID del medidor a vincular', example: '100' })
  @IsNotEmpty()
  @IsNumberString()
  medidorId: string;

  @ApiProperty({
    description: 'Dirección del suministro',
    example: 'Av. Principal 123',
  })
  @IsNotEmpty()
  @IsString()
  @IsNotEmptyString()
  direccionSuministro: string;

  @ApiProperty({ description: 'ID de la comunidad', example: '1' })
  @IsNotEmpty()
  @IsNumberString()
  comunidadId: string;

  @ApiPropertyOptional({
    description: 'ID del sector (opcional)',
    example: '3',
  })
  @IsOptional()
  @IsNumberString()
  sectorId?: string;

  @ApiPropertyOptional({
    description: 'Lectura inicial del medidor',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lecturaInicial?: number;

  @ApiPropertyOptional({
    enum: EstadoServicioContrato,
    description:
      'El alta siempre inicia en PENDIENTE_INSPECCION; este campo no adelanta el flujo.',
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(EstadoServicioContrato))
  estadoServicio?: EstadoServicioContrato;

  @ApiPropertyOptional({
    enum: EstadoCobranzaContrato,
    description: 'El alta siempre inicia con cobranza NO_APLICA.',
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(EstadoCobranzaContrato))
  estadoCobranza?: EstadoCobranzaContrato;

  @ApiPropertyOptional({
    description: 'Usuario que crea el contrato',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  creadoPor?: string;

  @IsContractLatitude()
  latitud?: number | null;

  @IsContractLongitude()
  longitud?: number | null;
}
