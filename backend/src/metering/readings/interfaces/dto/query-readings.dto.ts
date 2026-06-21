import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export class QueryReadingsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  contratoId?: string;
}
