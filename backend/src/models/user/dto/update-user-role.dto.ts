import { IsInt, IsOptional } from 'class-validator';

export class UpdateUserRoleDto {
  @IsInt()
  usersRolesId: number;

  @IsInt()
  rolesId: number;

  @IsOptional()
  deletedAt?: Date;
}
