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
import { EstadoContrato } from 'src/shared/enums';

export class CrearContratoMedidorDto {
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
    description: 'Número de guía del contrato',
    example: 'GU-2024-001',
  })
  @IsNotEmpty()
  @IsString()
  @IsNotEmptyString()
  numeroGuia: string;

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
    description: 'Estado inicial del contrato',
    enum: EstadoContrato,
    default: EstadoContrato.SOLICITUD,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(EstadoContrato))
  estado?: string;

  @ApiPropertyOptional({
    description: 'Usuario que crea el contrato',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  creadoPor?: string;
}
