import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from '../user/user.service';
import { MenuResponseDto } from './dto/response-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService, private readonly userService: UserService) { }

  async getMyMenus(userId: number): Promise<MenuResponseDto[]> {
    //Obtener permisos efectivos del usuario (roles + overrides)
    const permissions = await this.userService.getEffectivePermissions(userId);

    if (permissions.length === 0) {
      return [];
    }

    //Convertir permisos a formato DB
    const permissionConditions = permissions.map(p => ({ resource: p.resource, action: p.action }));

    // 1. Obtener los menús a los que el usuario tiene acceso directo
    const directMenus = await this.prisma.menus.findMany({
      where: {
        menuPermissions: {
          some: {
            permissions: {
              OR: permissionConditions,
            },
          },
        },
        active: true,
        deletedAt: null,
      },
    });

    // 2. Recorrer recurrentemente para incluir a los padres en caso de que falten en el arreglo final
    const menuMap = new Map<number, any>();
    directMenus.forEach(m => menuMap.set(m.menusId, m));

    let currentMenus = directMenus;
    while (currentMenus.length > 0) {
      // Obtener IDs de padres que aún no hemos mapeado
      const missingParentIds = [...new Set(currentMenus
        .map(m => m.menusParentId)
        .filter(id => id !== null && id !== undefined && !menuMap.has(id)))];

      if (missingParentIds.length === 0) break;

      const parentMenus = await this.prisma.menus.findMany({
        where: {
          menusId: { in: missingParentIds as number[] },
          active: true,
          deletedAt: null,
        }
      });

      parentMenus.forEach(m => menuMap.set(m.menusId, m));
      currentMenus = parentMenus;
    }

    // Ordenar finalmentente
    const finalMenus = Array.from(menuMap.values()).sort((a, b) => a.menusId - b.menusId);

    //Construir árbol de menús
    const fullTree = this.buildMenuTree(finalMenus);

    // Limitar el árbol a 2 niveles (Padre -> Funcionalidad), 
    // eliminando el 3er nivel (permisos individuales como Crear, Listar, etc.)
    fullTree.forEach(level1 => {
      if (level1.children && level1.children.length > 0) {
        level1.children.forEach(level2 => {
          // Vaciamos los hijos del nivel 2 para que sea un link directo y no un desplegable
          level2.children = [];
        });
      }
    });

    return fullTree;
  }

  //Función para construir el árbol de menús
  private buildMenuTree(menuList: any[]): MenuResponseDto[] {
    const menuMap = new Map<number, MenuResponseDto>();
    const tree: MenuResponseDto[] = [];

    menuList.forEach(menu => {
      // Mapeamos los campos de la db al dto esperado por el frontend
      const mappedMenu: MenuResponseDto = {
        id: menu.menusId,
        parent_menu_id: menu.menusParentId,
        name: menu.name, // El frontend necesita el nombre ('label')
        route: menu.route, // El frontend necesita la ruta
        is_active: menu.active,
        created_at: null, // Puedes enviar 'createdAt' si está en el modelo
        children: [],
      };
      menuMap.set(menu.menusId, mappedMenu);
    });

    for (const menu of menuMap.values()) {
      if (menu.parent_menu_id && menuMap.has(menu.parent_menu_id)) {
        menuMap.get(menu.parent_menu_id)!.children!.push(menu);
      } else {
        tree.push(menu);
      }
    }

    return tree;
  }
}
