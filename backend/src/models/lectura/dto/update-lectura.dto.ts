import { PartialType } from '@nestjs/mapped-types';
import { CrearLecturaDto } from './create-lectura.dto';

export class ActualizarLecturaDto extends PartialType(CrearLecturaDto) {}