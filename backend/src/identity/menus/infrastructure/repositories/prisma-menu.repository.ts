import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { MenuRepository } from '../../domain/repositories/menu.repository';
import { MenuRecord } from '../../domain/types/menu.types';
import { MenuMapper } from '../mappers/menu.mapper';

@Injectable()
export class PrismaMenuRepository implements MenuRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveMenusByPermissions(
    permissions: { recurso: string; accion: string }[],
  ): Promise<MenuRecord[]> {
    const menus = await this.prisma.menus.findMany({
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
    });
    return menus.map((menu) => MenuMapper.toEntity(menu)!);
  }

  async findActiveMenusByIds(menuIds: number[]): Promise<MenuRecord[]> {
    const menus = await this.prisma.menus.findMany({
      where: {
        menuId: { in: menuIds },
        activo: true,
        deletedAt: null,
      },
    });
    return menus.map((menu) => MenuMapper.toEntity(menu)!);
  }
}
