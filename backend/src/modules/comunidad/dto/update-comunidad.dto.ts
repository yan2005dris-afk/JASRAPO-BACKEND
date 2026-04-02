import { PartialType } from '@nestjs/swagger';
import { CreateComunidadeDto } from './create-comunidad.dto';

export class UpdateComunidadDto extends PartialType(CreateComunidadeDto) {}
