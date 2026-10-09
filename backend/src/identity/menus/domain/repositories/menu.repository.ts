import type { MenuRow } from '../types/menu.types';

export abstract class MenuRepository {
  abstract findActiveMenusByPermissions(
    permissions: { recurso: string; accion: string }[],
  ): Promise<MenuRow[]>;

  abstract findActiveMenusByIds(menuIds: number[]): Promise<MenuRow[]>;
}
