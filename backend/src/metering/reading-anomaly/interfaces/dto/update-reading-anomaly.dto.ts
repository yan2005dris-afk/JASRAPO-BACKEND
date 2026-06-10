import { PartialType } from '@nestjs/swagger';
import { CreateReadingAnomalyDto } from './create-reading-anomaly.dto';

export class UpdateReadingAnomalyDto extends PartialType(
  CreateReadingAnomalyDto,
) {}
