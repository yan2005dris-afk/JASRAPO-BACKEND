import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

export class CreateMenuDto {
  @ApiPropertyOptional({
    description: 'ID del menú padre (para menús anidados)',
    example: 1,
    type: 'integer',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  parent_menu_id?: number;

  @ApiPropertyOptional({
    description: 'Nombre del ícono (clase CSS o nombre de icono)',
    example: 'fa-user',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    description: 'Nombre del menú',
    example: 'Gestión de Usuarios',
    maxLength: 100,
    required: true,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Ruta del menú (endpoint o path)',
    example: '/users',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  route?: string;

  @ApiPropertyOptional({
    description: 'Indica si el menú está activo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

