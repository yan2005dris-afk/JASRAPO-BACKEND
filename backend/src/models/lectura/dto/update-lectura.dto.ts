import { PartialType } from '@nestjs/mapped-types';
import { CreateLecturaDto } from './create-lectura.dto';

export class UpdateLecturaDto extends PartialType(CreateLecturaDto) {}
