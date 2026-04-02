import { PartialType } from '@nestjs/mapped-types';
import { CrearNovedadOperativaDto } from './create-novedad-operativa.dto';

export class ActualizarNovedadOperativaDto extends PartialType(CrearNovedadOperativaDto) {}