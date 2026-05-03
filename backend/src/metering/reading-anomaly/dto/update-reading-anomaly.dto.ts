import { PartialType } from '@nestjs/mapped-types';
import { CreateReadingAnomalyDto } from './create-reading-anomaly.dto';

export class UpdateReadingAnomalyDto extends PartialType(
  CreateReadingAnomalyDto,
) {}
