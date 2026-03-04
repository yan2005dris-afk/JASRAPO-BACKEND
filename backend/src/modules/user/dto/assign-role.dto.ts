import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    description: 'ID del rol a asignar al usuario',
    example: 2,
  })
  @IsInt()
  rolesId: number;
}
