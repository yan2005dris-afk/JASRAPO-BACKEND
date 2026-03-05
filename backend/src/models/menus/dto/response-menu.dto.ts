import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MenuResponseDto {
  @ApiProperty({
    description: 'ID único del menú',
    example: 1,
    type: 'integer',
  })
  id: number;

  @ApiPropertyOptional({
    description: 'ID del menú padre (null si es raíz)',
    example: null,
    type: 'integer',
    nullable: true,
  })
  parent_menu_id?: number | null;

  @ApiPropertyOptional({
    description: 'Nombre del ícono asociado al menú',
    example: 'fa-user',
    nullable: true,
  })
  icon?: string;

  @ApiPropertyOptional({
    description: 'Nombre del menú',
    example: 'Gestión de Usuarios',
    nullable: true,
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Ruta o path del menú',
    example: '/users',
    nullable: true,
  })
  route?: string;

  @ApiPropertyOptional({
    description: 'Indica si el menú está activo',
    example: true,
  })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de creación del menú',
    example: '2024-01-15T10:30:00.000Z',
    nullable: true,
  })
  created_at?: Date | null;

  @ApiPropertyOptional({
    description: 'Lista de menús hijos (submenús)',
    type: [MenuResponseDto],
    nullable: true,
  })
  children?: MenuResponseDto[];
}

/**
 * Ejemplo de respuesta del endpoint GET /menus/my
 */
export const MenuResponseExample = [
  {
    id: 1,
    parent_menu_id: null,
    icon: 'fa-home',
    name: 'Inicio',
    route: '/dashboard',
    is_active: true,
    created_at: new Date('2024-01-15T10:30:00.000Z'),
    children: [],
  },
  {
    id: 2,
    parent_menu_id: null,
    icon: 'fa-users',
    name: 'Gestión de Usuarios',
    route: undefined,
    is_active: true,
    created_at: new Date('2024-01-15T10:30:00.000Z'),
    children: [
      {
        id: 3,
        parent_menu_id: 2,
        icon: 'fa-user',
        name: 'Usuarios',
        route: '/users',
        is_active: true,
        created_at: undefined,
        children: [],
      },
      {
        id: 4,
        parent_menu_id: 2,
        icon: 'fa-shield-alt',
        name: 'Roles',
        route: '/roles',
        is_active: true,
        created_at: undefined,
        children: [],
      },
      {
        id: 5,
        parent_menu_id: 2,
        icon: 'fa-key',
        name: 'Permisos',
        route: '/permissions',
        is_active: true,
        created_at: undefined,
        children: [],
      },
    ],
  },
  {
    id: 6,
    parent_menu_id: null,
    icon: 'fa-file-invoice',
    name: 'Facturación',
    route: undefined,
    is_active: true,
    created_at: new Date('2024-01-15T10:30:00.000Z'),
    children: [
      {
        id: 7,
        parent_menu_id: 6,
        icon: 'fa-file-invoice-dollar',
        name: 'Facturas',
        route: '/invoices',
        is_active: true,
        created_at: undefined,
        children: [],
      },
      {
        id: 8,
        parent_menu_id: 6,
        icon: 'fa-money-bill-wave',
        name: 'Pagos',
        route: '/payments',
        is_active: true,
        created_at: undefined,
        children: [],
      },
    ],
  },
  {
    id: 9,
    parent_menu_id: null,
    icon: 'fa-cogs',
    name: 'Configuración',
    route: '/settings',
    is_active: true,
    created_at: new Date('2024-01-15T10:30:00.000Z'),
    children: [],
  },
];

