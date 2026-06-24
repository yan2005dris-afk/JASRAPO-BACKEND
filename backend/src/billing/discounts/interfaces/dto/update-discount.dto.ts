import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateDiscountDto } from './create-discount.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {
  @ApiPropertyOptional({ description: 'Activar o desactivar el descuento' })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
