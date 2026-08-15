import type { MenuEntity } from '../entities/menu.entity';

export abstract class MenuRepository {
  abstract findActiveMenusByPermissions(
    permissions: { recurso: string; accion: string }[],
  ): Promise<MenuEntity[]>;

  abstract findActiveMenusByIds(menuIds: number[]): Promise<MenuEntity[]>;
}
