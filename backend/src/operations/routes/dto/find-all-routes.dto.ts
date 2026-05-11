import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoRuta } from 'src/generated/prisma/client';

export class FindAllRoutesDto {
  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number;

  @ApiProperty({ required: false, enum: EstadoRuta })
  @IsOptional()
  @IsEnum(EstadoRuta)
  estado?: EstadoRuta;
}
