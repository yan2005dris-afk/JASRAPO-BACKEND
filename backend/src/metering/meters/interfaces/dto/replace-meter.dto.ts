import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoSaliente,
  TratamientoEntrante,
} from 'src/shared/enums';

export class ReplaceMeterDto {
  @ApiProperty({
    description: 'ID del contrato donde se realiza el cambio',
    example: '1',
  })
  @IsNotEmpty({ message: 'El ID de contrato es obligatorio' })
  contratoId: string;

  @ApiProperty({
    description: 'ID del nuevo medidor a instalar',
    example: '5',
  })
  @IsNotEmpty({ message: 'El ID del nuevo medidor es obligatorio' })
  nuevoMedidorId: string;

  @ApiProperty({
    description: 'Lectura física final del medidor retirado',
    example: 530,
  })
  @IsNumber(
    {},
    { message: 'La lectura final del medidor saliente debe ser un número' },
  )
  @Min(0, { message: 'La lectura final no puede ser negativa' })
  lecturaFinalSaliente: number;

  @ApiPropertyOptional({
    description: 'Lectura física inicial del nuevo medidor (0 por defecto)',
    example: 0,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'La lectura inicial del nuevo medidor debe ser un número' },
  )
  @Min(0, { message: 'La lectura inicial no puede ser negativa' })
  lecturaInicialEntrante?: number;

  @ApiProperty({
    description: 'Motivo operativo del reemplazo',
    enum: MotivoReemplazoMedidor,
    example: MotivoReemplazoMedidor.DANO,
  })
  @IsEnum(MotivoReemplazoMedidor, { message: 'Motivo de reemplazo inválido' })
  motivo: MotivoReemplazoMedidor;

  @ApiPropertyOptional({
    description: 'Atribución de responsabilidad del daño',
    enum: ResponsabilidadDano,
    example: ResponsabilidadDano.NO_APLICA,
  })
  @IsOptional()
  @IsEnum(ResponsabilidadDano, { message: 'Responsabilidad de daño inválida' })
  responsabilidadDano?: ResponsabilidadDano;

  @ApiPropertyOptional({
    description: 'Detalle u observación del motivo',
    example: 'Pantalla rota y fuga visible',
  })
  @ValidateIf((o) => o.motivo === MotivoReemplazoMedidor.OTRO)
  @IsNotEmpty({
    message: 'El detalle del motivo es obligatorio cuando el motivo es OTRO',
  })
  @IsOptional()
  @IsString()
  detalleMotivo?: string;

  @ApiProperty({
    description: 'Tratamiento económico para el consumo del medidor saliente',
    enum: TratamientoSaliente,
    example: TratamientoSaliente.COBRO_REAL,
  })
  @IsEnum(TratamientoSaliente, { message: 'Tratamiento saliente inválido' })
  tratamientoSaliente: TratamientoSaliente;

  @ApiProperty({
    description: 'Tratamiento del consumo del medidor entrante',
    enum: TratamientoEntrante,
    example: TratamientoEntrante.FACTURAR_PERIODO_ACTUAL,
  })
  @IsEnum(TratamientoEntrante, { message: 'Tratamiento entrante inválido' })
  tratamientoEntrante: TratamientoEntrante;

  @ApiPropertyOptional({
    description: 'Porcentaje de cobro (1-100) en caso de COBRO_PARCIAL',
    example: 50,
  })
  @ValidateIf((o) => o.tratamientoSaliente === TratamientoSaliente.COBRO_PARCIAL)
  @IsNotEmpty({
    message: 'El porcentaje de cobro es obligatorio para COBRO_PARCIAL',
  })
  @IsNumber({}, { message: 'El porcentaje de cobro debe ser numérico' })
  @Min(1, { message: 'El porcentaje de cobro mínimo es 1%' })
  @Max(100, { message: 'El porcentaje de cobro máximo es 100%' })
  @IsOptional()
  porcentajeCobro?: number;

  @ApiPropertyOptional({
    description:
      'Cantidad de meses para el cálculo del promedio histórico (ej. 3 o 6)',
    example: 3,
  })
  @ValidateIf(
    (o) => o.tratamientoSaliente === TratamientoSaliente.PROMEDIO_HISTORICO,
  )
  @IsNotEmpty({
    message: 'La ventana de promedio es obligatoria para PROMEDIO_HISTORICO',
  })
  @IsNumber({}, { message: 'La ventana de promedio debe ser numérica' })
  @Min(1, { message: 'La ventana de promedio mínima es 1 mes' })
  @Max(24, { message: 'La ventana de promedio máxima es 24 meses' })
  @IsOptional()
  ventanaPromedio?: number;

  @ApiProperty({
    description: 'ID del período de facturación actual u origen',
    example: 1,
  })
  @IsNumber({}, { message: 'El ID del período origen debe ser un número' })
  periodoOrigenId: number;

  @ApiPropertyOptional({
    description: 'ID del período destino si se difiere el cobro',
    example: 2,
  })
  @ValidateIf(
    (o) =>
      o.tratamientoEntrante ===
      TratamientoEntrante.DIFERIR_SIGUIENTE_PERIODO,
  )
  @IsNotEmpty({
    message: 'El período destino es obligatorio al diferir el cobro',
  })
  @IsNumber({}, { message: 'El ID del período destino debe ser un número' })
  @IsOptional()
  periodoDestinoId?: number;

  @ApiPropertyOptional({
    description: 'ID de la orden de trabajo asociada',
    example: '10',
  })
  @IsOptional()
  ordenTrabajoId?: string;

  @ApiPropertyOptional({
    description: 'Fecha en que se efectuó el reemplazo (ISO Date String)',
  })
  @IsOptional()
  @IsString()
  fechaReemplazo?: string;
}
