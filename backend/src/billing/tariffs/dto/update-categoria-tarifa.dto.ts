import { PartialType } from '@nestjs/swagger';
import { CreateCategoriaTarifaDto } from './create-categoria-tarifa.dto';

export class UpdateCategoriaTarifaDto extends PartialType(
  CreateCategoriaTarifaDto,
) {}
