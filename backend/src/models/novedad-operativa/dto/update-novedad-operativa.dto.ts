import { PartialType } from '@nestjs/mapped-types';
import { CreateNovedadOperativaDto } from './create-novedad-operativa.dto';

export class UpdateNovedadOperativaDto extends PartialType(CreateNovedadOperativaDto) {}