import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'ID de la relación usuario-rol (users_roles)',
    example: 1,
    required: true,
  })
  @IsInt()
  usersRolesId: number;

  @ApiProperty({
    description: 'ID del nuevo rol a asignar',
    example: 2,
    required: true,
  })
  @IsInt()
  rolesId: number;

  @ApiPropertyOptional({
    description: 'Fecha de eliminación (soft delete)',
    example: null,
    nullable: true,
  })
  @IsOptional()
  deletedAt?: Date;
}

