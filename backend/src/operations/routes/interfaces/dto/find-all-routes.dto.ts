import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoRuta } from '../../domain/enums/estado-ruta.enum';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export class FindAllRoutesDto extends PaginationDto {
  @ApiProperty({ required: false, enum: EstadoRuta })
  @IsOptional()
  @IsEnum(EstadoRuta)
  estado?: EstadoRuta;
}
