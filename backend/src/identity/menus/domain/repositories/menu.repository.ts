import { MenuRecord } from '../types/menu.types';

export abstract class MenuRepository {
  abstract findActiveMenusByPermissions(
    permissions: { recurso: string; accion: string }[],
  ): Promise<MenuRecord[]>;

  abstract findActiveMenusByIds(menuIds: number[]): Promise<MenuRecord[]>;
}
