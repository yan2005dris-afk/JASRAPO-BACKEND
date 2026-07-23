import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  Matches,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EmisorDto,
  CampoAdicionalDto,
  DetalleAdicionalDto,
} from './common.dto';
import { Ambiente, TipoEmision } from '../../domain/constants';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

/**
 * Detalle de un producto/mercadería transportado en la guía de remisión
 */
export class DetalleGuiaRemisionDto {
  @ApiProperty({ description: 'Código interno del producto' })
  @IsNotEmptyString()
  @MaxLength(50)
  codigoInterno: string;

  @ApiPropertyOptional({ description: 'Código adicional del producto' })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(50)
  codigoAdicional?: string;

  @ApiProperty({ description: 'Descripción del producto o mercadería' })
  @IsNotEmptyString()
  @MaxLength(300)
  descripcion: string;

  @ApiProperty({ description: 'Cantidad transportada' })
  @IsNumber()
  @Min(0)
  cantidad: number;

  @ApiPropertyOptional({
    description: 'Detalles adicionales del producto',
    type: [DetalleAdicionalDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleAdicionalDto)
  detallesAdicionales?: DetalleAdicionalDto[];
}

/**
 * Información del destinatario de la mercadería
 */
export class DestinatarioGuiaRemisionDto {
  @ApiProperty({
    description:
      'Tipo de identificación del destinatario (04=RUC, 05=Cédula, 06=Pasaporte, 07=Consumidor Final, 08=Identificación del Exterior)',
  })
  @IsString()
  @Matches(/^\d{2}$/, {
    message: 'El tipo de identificación debe tener 2 dígitos',
  })
  tipoIdentificacionDestinatario: string;

  @ApiProperty({ description: 'Número de identificación del destinatario' })
  @IsNotEmptyString()
  @MaxLength(20)
  identificacionDestinatario: string;

  @ApiProperty({ description: 'Razón social del destinatario' })
  @IsNotEmptyString()
  @MaxLength(300)
  razonSocialDestinatario: string;

  @ApiProperty({ description: 'Dirección del destinatario' })
  @IsNotEmptyString()
  @MaxLength(300)
  dirDestinatario: string;

  @ApiPropertyOptional({
    description: 'Email del destinatario para envío automático',
  })
  @IsOptional()
  @IsNotEmptyString()
  @IsEmail()
  @MaxLength(255)
  emailDestinatario?: string;

  @ApiProperty({ description: 'Motivo del traslado de la mercadería' })
  @IsNotEmptyString()
  @MaxLength(300)
  motivoTraslado: string;

  @ApiPropertyOptional({ description: 'Número de documento aduanero único' })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(20)
  docAduaneroUnico?: string;

  @ApiPropertyOptional({
    description: 'Código del establecimiento destino (3 dígitos)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{3}$/, {
    message: 'El código de establecimiento destino debe tener 3 dígitos',
  })
  codEstabDestino?: string;

  @ApiPropertyOptional({ description: 'Ruta del traslado' })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(300)
  ruta?: string;

  @ApiPropertyOptional({ description: 'Código del documento sustento' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}$/, { message: 'El código debe tener 2 dígitos' })
  codDocSustento?: string;

  @ApiPropertyOptional({
    description: 'Número del documento sustento (ej: 001-001-000000001)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{3}-\d{3}-\d{9}$/, {
    message: 'El formato debe ser 001-001-000000001',
  })
  numDocSustento?: string;

  @ApiPropertyOptional({
    description: 'Número de autorización del documento sustento',
  })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(49)
  numAutDocSustento?: string;

  @ApiPropertyOptional({
    description: 'Fecha de emisión del documento sustento (dd/mm/yyyy)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'La fecha debe tener el formato dd/mm/yyyy',
  })
  fechaEmisionDocSustento?: string;

  @ApiProperty({
    description: 'Mercadería transportada para este destinatario',
    type: [DetalleGuiaRemisionDto],
  })
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Debe indicar al menos un detalle de mercadería',
  })
  @ValidateNested({ each: true })
  @Type(() => DetalleGuiaRemisionDto)
  detalles: DetalleGuiaRemisionDto[];
}

/**
 * DTO para crear una Guía de Remisión electrónica
 */
export class CreateGuiaRemisionDto {
  @ApiPropertyOptional({
    description: 'Ambiente de emisión',
    enum: Ambiente,
    default: Ambiente.PRUEBAS,
  })
  @IsOptional()
  @IsEnum(Ambiente)
  ambiente?: Ambiente;

  @ApiPropertyOptional({
    description: 'Tipo de emisión',
    enum: TipoEmision,
    default: TipoEmision.NORMAL,
  })
  @IsOptional()
  @IsEnum(TipoEmision)
  tipoEmision?: TipoEmision;

  @ApiPropertyOptional({
    description:
      'Número secuencial de la guía de remisión (auto-generado si se omite)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,9}$/, {
    message: 'El secuencial debe ser numérico de hasta 9 dígitos',
  })
  secuencial?: string;

  @ApiProperty({
    description: 'Información del emisor',
    type: EmisorDto,
  })
  @ValidateNested()
  @Type(() => EmisorDto)
  emisor: EmisorDto;

  @ApiProperty({ description: 'Dirección de partida de la mercadería' })
  @IsNotEmptyString()
  @MaxLength(300)
  dirPartida: string;

  @ApiProperty({
    description: 'Fecha de inicio del transporte (dd/mm/yyyy)',
  })
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'La fecha debe tener el formato dd/mm/yyyy',
  })
  fechaIniTransporte: string;

  @ApiProperty({ description: 'Fecha de fin del transporte (dd/mm/yyyy)' })
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'La fecha debe tener el formato dd/mm/yyyy',
  })
  fechaFinTransporte: string;

  @ApiProperty({
    description: 'Tipo de identificación del transportista (2 dígitos)',
  })
  @IsString()
  @Matches(/^\d{2}$/, {
    message: 'El tipo de identificación debe tener 2 dígitos',
  })
  tipoIdentificacionTransportista: string;

  @ApiProperty({ description: 'RUC o identificación del transportista' })
  @IsNotEmptyString()
  @MaxLength(20)
  rucTransportista: string;

  @ApiProperty({ description: 'Razón social del transportista' })
  @IsNotEmptyString()
  @MaxLength(300)
  razonSocialTransportista: string;

  @ApiProperty({ description: 'Placa del vehículo transportista' })
  @IsNotEmptyString()
  @MaxLength(20)
  placa: string;

  @ApiProperty({
    description: 'Destinatarios de la mercadería transportada',
    type: [DestinatarioGuiaRemisionDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe indicar al menos un destinatario' })
  @ValidateNested({ each: true })
  @Type(() => DestinatarioGuiaRemisionDto)
  destinatarios: DestinatarioGuiaRemisionDto[];

  @ApiPropertyOptional({
    description: 'Información adicional',
    type: [CampoAdicionalDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampoAdicionalDto)
  infoAdicional?: CampoAdicionalDto[];
}

/**
 * Respuesta de emisión de Guía de Remisión
 */
export class GuiaRemisionResponseDto {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Clave de acceso de 49 dígitos' })
  claveAcceso: string;

  @ApiProperty({ description: 'Estado del comprobante' })
  estado: string;

  @ApiPropertyOptional({ description: 'Fecha de autorización' })
  fechaAutorizacion?: string;

  @ApiPropertyOptional({ description: 'Número de autorización' })
  numeroAutorizacion?: string;

  @ApiPropertyOptional({ description: 'XML del comprobante autorizado' })
  xmlAutorizado?: string;

  @ApiPropertyOptional({ description: 'Mensajes del SRI' })
  mensajes?: any[];
}
