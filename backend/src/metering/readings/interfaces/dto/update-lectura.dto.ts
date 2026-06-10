import { PartialType } from '@nestjs/swagger';
import { CrearLecturaDto } from './create-lectura.dto';

export class ActualizarLecturaDto extends PartialType(CrearLecturaDto) {}
