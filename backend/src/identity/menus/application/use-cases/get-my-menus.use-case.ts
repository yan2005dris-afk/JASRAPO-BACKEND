import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../../../users/application/user.service';
import { MenuResponseDto } from '../../interfaces/dto/response-menu.dto';
import { MenuRecord } from '../../domain/types/menu.types';
import { MenuRepository } from '../../domain/repositories/menu.repository';

@Injectable()
export class GetMyMenusUseCase {
  private readonly logger = new Logger(GetMyMenusUseCase.name);

  constructor(
    private readonly menuRepository: MenuRepository,
    private readonly userService: UserService,
  ) {}

  async execute(userId: number): Promise<MenuResponseDto[]> {
    // Obtener permisos efectivos del usuario (roles + permisos directos)
    const result = await this.userService.getEffectivePermissions(userId);
    const permisos = result.permisos;

    if (permisos.length === 0) {
      return [];
    }

    const filtrosPermisos = permisos.map((permission) => ({
      recurso: permission.recurso,
      accion: permission.accion,
    }));

    // 1. Obtener los acciones que el usuario tiene acceso directo
    const directMenus = await this.menuRepository.findActiveMenusByPermissions(
      filtrosPermisos,
    );

    // 2. Recorrer recurrentemente para incluir a los padres en caso de que falten
    const menuMap = new Map<number, MenuRecord>();
    directMenus.forEach((m) => menuMap.set(m.menuId, m));

    let currentMenus: MenuRecord[] = directMenus;
    while (currentMenus.length > 0) {
      const missingParentIds = [
        ...new Set(
          currentMenus
            .map((m) => m.menuPadreId)
            .filter(
              (id) => id !== null && id !== undefined && !menuMap.has(id),
            ),
        ),
      ];

      if (missingParentIds.length === 0) break;

      const parentMenus = await this.menuRepository.findActiveMenusByIds(
        missingParentIds as number[],
      );

      parentMenus.forEach((m) => menuMap.set(m.menuId, m));
      currentMenus = parentMenus;
    }

    // Ordenar y construir árbol
    const finalMenus: MenuRecord[] = Array.from(menuMap.values()).sort(
      (a, b) => a.menuId - b.menuId,
    );

    const fullTree = this.buildMenuTree(finalMenus);

    this.logger.log(`Menu tree built for user ${userId}`);
    return fullTree;
  }

  private buildMenuTree(menuList: MenuRecord[]): MenuResponseDto[] {
    const menuMap = new Map<number, MenuResponseDto>();
    const tree: MenuResponseDto[] = [];

    menuList.forEach((menu) => {
      const mappedMenu: MenuResponseDto = {
        id: menu.menuId,
        parent_menu_id: menu.menuPadreId,
        name: menu.nombre,
        route: menu.ruta,
        icon: menu.icono ?? null,
        is_active: menu.activo,
        children: [],
      };
      menuMap.set(menu.menuId, mappedMenu);
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
