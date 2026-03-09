import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from '../user/user.service';
import { MenuResponseDto } from './dto/response-menu.dto';
import {
  EffectivePermission,
  MenuRecord,
  PermissionCondition,
} from './types/menu.types';

@Injectable()
export class MenusService {
  private readonly logger = new Logger(MenusService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async getMyMenus(userId: number): Promise<MenuResponseDto[]> {
    //Obtener permisos efectivos del usuario (roles + permisos directos)
    const permissions = (await this.userService.getEffectivePermissions(
      userId,
    )) as EffectivePermission[];

    if (permissions.length === 0) {
      return [];
    }
    //Construir condiciones OR para la consulta de menús
    // 1. Obtener los acciones que el usuario tiene acceso directo
    const directMenus = await this.prisma.menus.findMany({
      where: {
        menuPermissions: {
          some: {
            permissions: {
              OR: permissions,
            },
          },
        },
        active: true,
        deletedAt: null,
      },
    });

    // 2. Recorrer recurrentemente para incluir a los padres en caso de que falten en el arreglo final
    const menuMap = new Map<number, MenuRecord>();
    directMenus.forEach((m) => menuMap.set(m.menusId, m));

    let currentMenus: MenuRecord[] = directMenus;
    while (currentMenus.length > 0) {
      // Obtener IDs de padres que aún no hemos mapeado
      const missingParentIds = [
        ...new Set(
          currentMenus
            .map((m) => m.menusParentId)
            .filter(
              (id) => id !== null && id !== undefined && !menuMap.has(id),
            ),
        ),
      ];

      if (missingParentIds.length === 0) break;

      const parentMenus = await this.prisma.menus.findMany({
        where: {
          menusId: { in: missingParentIds as number[] },
          active: true,
          deletedAt: null,
        },
      });

      parentMenus.forEach((m) => menuMap.set(m.menusId, m));
      currentMenus = parentMenus;
    }

    // Ordenar finalmentente
    const finalMenus: MenuRecord[] = Array.from(menuMap.values()).sort(
      (a, b) => a.menusId - b.menusId,
    );

    //Construir árbol de menús
    const fullTree = this.buildMenuTree(finalMenus);

    // Limitar el árbol a 2 niveles (Padre -> Funcionalidad),
    // eliminando el 3er nivel (permisos individuales como Crear, Listar, etc.)
    fullTree.forEach((level1) => {
      if (level1.children && level1.children.length > 0) {
        level1.children.forEach((level2) => {
          // Vaciamos los hijos del nivel 2 para que sea un link directo y no un desplegable
          level2.children = [];
        });
      }
    });
    this.logger.log('Árbol de menús final para el usuario: ' + JSON.stringify(fullTree));
    return fullTree;
  }

  //Función para construir el árbol de menús
  private buildMenuTree(menuList: MenuRecord[]): MenuResponseDto[] {
    const menuMap = new Map<number, MenuResponseDto>();
    const tree: MenuResponseDto[] = [];

    menuList.forEach((menu) => {
      // Mapeamos los campos de la db al dto esperado por el frontend
      const mappedMenu: MenuResponseDto = {
        id: menu.menusId,
        parent_menu_id: menu.menusParentId,
        name: menu.name, // El frontend necesita el nombre ('label')
        route: menu.route, // El frontend necesita la ruta
        icon: menu.icon ?? null, // El frontend necesita el icono
        is_active: menu.active,
        created_at: menu.createdAt ? new Date(menu.createdAt) : null,
        children: [],
      };
      menuMap.set(menu.menusId, mappedMenu);
    });

    for (const menu of menuMap.values()) {
      const parentId = menu.parent_menu_id;
      if (
        parentId !== null &&
        parentId !== undefined &&
        menuMap.has(parentId)
      ) {
        menuMap.get(parentId)!.children!.push(menu);
      } else {
        tree.push(menu);
      }
    }

    return tree;
  }
}
