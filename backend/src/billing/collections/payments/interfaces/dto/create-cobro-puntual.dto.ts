import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { CreatePaymentDto } from './create-payment.dto';
import { OmitType } from '@nestjs/swagger';

export class CobroPuntualItemDto {
  @IsInt()
  @IsPositive()
  rubroId: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class CreateCobroPuntualDto extends OmitType(CreatePaymentDto, [
  'detalle',
  'montoTotalRecibido',
] as const) {
  @IsString()
  @Matches(/^\d+$/)
  contratoId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CobroPuntualItemDto)
  items: CobroPuntualItemDto[];
}
