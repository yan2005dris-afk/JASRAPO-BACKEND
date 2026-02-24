import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { MenuResponseDto } from './dto/response-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyMenus(userId: number): Promise<MenuResponseDto[]> {
    //Permisos por roles del usuario
    const rolePermissions = await this.prisma.rolPermissions.findMany({
      where: {
        roles: {
          userRoles: {
            some:{ usersId: userId , deletedAt: null },
          },
        },
      },
      select: { permissionsId: true },
    });

    //Permisos directos del usuario
    const userPermissions = await this.prisma.userPermissions.findMany({
      where: { usersId: userId, allow: true, deteledAt: null },
      select: { permissionsId: true },
    });

    //Unir permisos
    const permissionIds = [... new Set([
      ...rolePermissions.map(rp => rp.permissionsId),
      ...userPermissions.map(up => up.permissionsId)
    ])];

    //Obtener menús asociados a los permisos
    const menus = await this.prisma.menus.findMany({
      where: {
        menuPermissions: {
          some: {
            permissionsId: { in: permissionIds }, },
          },
          active: true,
          deletedAt: null,
        },
        orderBy: { menusId: 'asc' },
    });

    //Construir árbol de menús
    return this.buildMenuTree(menus);
  }

  //Función para construir el árbol de menús
  private buildMenuTree(menuList: any[]): MenuResponseDto[] {
    const menuMap = new Map<number, MenuResponseDto>();
    
    menuList.forEach(menu => {
      menuMap.set(menu.menusId, { ...menu, children: [] });
    });

    const tree: MenuResponseDto[] = [];

    for (const menu of menuMap.values()) {
      if (menu.menusParentId && menuMap.has(menu.menusParentId)) {
        menuMap.get(menu.menusParentId)!.children!.push(menu);
      } else {
        tree.push(menu);
      }
    }

    return tree;
  }
}
