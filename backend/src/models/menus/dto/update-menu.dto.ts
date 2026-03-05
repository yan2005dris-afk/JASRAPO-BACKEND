import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuDto } from './create-menu.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiPropertyOptional({
    description: 'ID del menú padre (para menús anidados)',
    example: 1,
    type: 'integer',
    nullable: true,
  })
  parent_menu_id?: number;

  @ApiPropertyOptional({
    description: 'Nombre del ícono (clase CSS o nombre de icono)',
    example: 'fa-user',
    maxLength: 50,
  })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Nombre del menú',
    example: 'Gestión de Usuarios',
    maxLength: 100,
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Ruta del menú (endpoint o path)',
    example: '/users',
    maxLength: 255,
  })
  route?: string;

  @ApiPropertyOptional({
    description: 'Indica si el menú está activo',
    example: true,
  })
  is_active?: boolean;
}

