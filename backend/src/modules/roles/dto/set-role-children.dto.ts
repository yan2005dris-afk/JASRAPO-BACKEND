import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsInt } from 'class-validator';

export class SetRoleChildrenDto {
  @ApiProperty({
    description: 'IDs de roles hijos que el rol padre heredará',
    example: [5, 6],
    type: [Number],
  })
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  childRoleIds: number[];
}
