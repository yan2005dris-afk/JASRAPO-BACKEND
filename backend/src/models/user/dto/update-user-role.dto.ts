import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'ID de la relación usuario-rol a actualizar',
    example: 1,
    type: 'integer',
    required: true,
  })
  @IsInt()
  usersRolesId: number;

  @ApiProperty({
    description: 'ID del nuevo rol a asignar',
    example: 2,
    type: 'integer',
    required: true,
  })
  @IsInt()
  rolesId: number;

  @ApiPropertyOptional({
    description: 'Fecha de eliminación del rol (si se desea eliminar la relación)',
    example: '2024-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  deletedAt?: Date;
}

