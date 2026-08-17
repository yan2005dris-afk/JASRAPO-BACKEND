import { PartialType } from '@nestjs/swagger';
import { CreateRubroDto } from './create-rubro.dto';

export class UpdateRubroDto extends PartialType(CreateRubroDto) {}
