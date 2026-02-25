import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from '../user/user.service';
import { MenuResponseDto } from './dto/response-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService, private readonly userService: UserService) {}

  async getMyMenus(userId: number): Promise<MenuResponseDto[]> {
    //Obtener permisos efectivos del usuario (roles + overrides)
    const permissions =  await this.userService.getEffectivePermissions(userId);

    //Convertir permisos a formato DB
    const permissionConditions = permissions.map(p => ({resource : p.resource, action: p.action}));
    
    //Obtener menus asociados a esos permisos
    const menus = await this.prisma.menus.findMany({
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
      orderBy: { menusId: 'asc' },
    });

    //Construir árbol de menús
    return this.buildMenuTree(menus);
  }

  //Función para construir el árbol de menús
  private buildMenuTree(menuList: any[]): MenuResponseDto[] {
    const menuMap = new Map<number, MenuResponseDto>();
    const tree: MenuResponseDto[] = [];

    menuList.forEach(menu => {
      menuMap.set(menu.menusId, { ...menu, children: [] });
    });

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
