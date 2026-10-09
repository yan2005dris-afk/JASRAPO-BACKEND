import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MenuRepository } from '../../domain/repositories/menu.repository';
import { menuInclude, type MenuRow } from './menu.include';

@Injectable()
export class PrismaMenuRepository implements MenuRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveMenusByPermissions(
    permissions: { recurso: string; accion: string }[],
  ): Promise<MenuRow[]> {
    return this.prisma.menus.findMany({
      where: {
        permisosMenu: {
          some: {
            permiso: {
              OR: permissions,
            },
          },
        },
        activo: true,
        deletedAt: null,
      },
      include: menuInclude,
    });
  }

  async findActiveMenusByIds(menuIds: number[]): Promise<MenuRow[]> {
    return this.prisma.menus.findMany({
      where: {
        menuId: { in: menuIds },
        activo: true,
        deletedAt: null,
      },
      include: menuInclude,
    });
  }
}
