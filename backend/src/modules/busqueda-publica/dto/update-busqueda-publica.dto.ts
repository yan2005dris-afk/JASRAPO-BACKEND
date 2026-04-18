import { PartialType } from '@nestjs/swagger';
import { CreateBusquedaPublicaDto } from './create-busqueda-publica.dto';

export class UpdateBusquedaPublicaDto extends PartialType(CreateBusquedaPublicaDto) {}
