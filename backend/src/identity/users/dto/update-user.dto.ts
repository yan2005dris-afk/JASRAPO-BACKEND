import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AssignPermissionDto } from './assign-permission.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'ID del rol a asignar al usuario',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  rolId?: number;

  @ApiProperty({
    description: 'Lista de permisos directos para asignar o actualizar',
    type: [AssignPermissionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignPermissionDto)
  directPermissions?: AssignPermissionDto[];
}
