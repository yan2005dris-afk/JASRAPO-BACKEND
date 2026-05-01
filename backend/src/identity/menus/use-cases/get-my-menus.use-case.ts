import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UserService } from '../../users/user.service';
import { MenuResponseDto } from '../dto/response-menu.dto';
import { EffectivePermission, MenuRecord } from '../types/menu.types';

@Injectable()
export class GetMyMenusUseCase {
  private readonly logger = new Logger(GetMyMenusUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async execute(userId: number): Promise<MenuResponseDto[]> {
    // Obtener permisos efectivos del usuario (roles + permisos directos)
    const permissions = (await this.userService.getEffectivePermissions(
      userId,
    )) as EffectivePermission[];

    if (permissions.length === 0) {
      return [];
    }

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

    // 2. Recorrer recurrentemente para incluir a los padres en caso de que falten
    const menuMap = new Map<number, MenuRecord>();
    directMenus.forEach((m) => menuMap.set(m.menusId, m));

    let currentMenus: MenuRecord[] = directMenus;
    while (currentMenus.length > 0) {
      const missingParentIds = [
        ...new Set(
          currentMenus
            .map((m) => m.menusParentId)
            .filter((id) => id !== null && id !== undefined && !menuMap.has(id)),
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

    // Ordenar y construir árbol
    const finalMenus: MenuRecord[] = Array.from(menuMap.values()).sort(
      (a, b) => a.menusId - b.menusId,
    );

    const fullTree = this.buildMenuTree(finalMenus);

    // Limitar a 2 niveles
    fullTree.forEach((level1) => {
      if (level1.children && level1.children.length > 0) {
        level1.children.forEach((level2) => {
          level2.children = [];
        });
      }
    });

    this.logger.log(`Menu tree built for user ${userId}`);
    return fullTree;
  }

  private buildMenuTree(menuList: MenuRecord[]): MenuResponseDto[] {
    const menuMap = new Map<number, MenuResponseDto>();
    const tree: MenuResponseDto[] = [];

    menuList.forEach((menu) => {
      const mappedMenu: MenuResponseDto = {
        id: menu.menusId,
        parent_menu_id: menu.menusParentId,
        name: menu.name,
        route: menu.route,
        icon: menu.icon ?? null,
        is_active: menu.active,
        created_at: menu.createdAt ? new Date(menu.createdAt) : null,
        children: [],
      };
      menuMap.set(menu.menusId, mappedMenu);
    });

    for (const menu of menuMap.values()) {
      const parentId = menu.parent_menu_id;
      if (parentId !== null && parentId !== undefined && menuMap.has(parentId)) {
        menuMap.get(parentId)!.children!.push(menu);
      } else {
        tree.push(menu);
      }
    }

    return tree;
  }
}
