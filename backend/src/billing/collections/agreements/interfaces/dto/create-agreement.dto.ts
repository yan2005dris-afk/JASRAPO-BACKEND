import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
  Min,
} from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class CreateAgreementDto {
  @ApiProperty({
    description: 'ID del contrato al que pertenece el convenio',
    example: '1',
  })
  @IsNotEmptyString()
  @MaxLength(50)
  contratoId: string;

  @ApiProperty({
    description: 'Número de cuotas en que se dividirá la deuda',
    example: 6,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  numeroCuotas: number;

  @ApiPropertyOptional({
    description:
      'Abono inicial que el cliente paga al firmar el convenio. Si se omite, se asume 0.',
    example: 50.0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  abonoInicial?: number;

  @ApiProperty({
    description: 'Fecha del primer pago de cuota (YYYY-MM-DD)',
    example: '2026-06-01',
  })
  @IsNotEmptyString()
  @MaxLength(10)
  fechaPrimerPago: string;

  @ApiPropertyOptional({
    description: 'Motivo o observación del convenio',
    example: 'El cliente solicita plazo por problemas económicos temporales',
  })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(500)
  motivo?: string;
}
