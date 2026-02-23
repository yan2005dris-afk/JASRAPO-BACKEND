import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PrismaService } from 'src/database/prisma.service';

interface Menu {
  menusId: number;
  menusParentId?: number | null;
  name: string;
  route: string;
  active: boolean;
  deletedAt?: Date | null;
  children?: Menu[];
}

@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('my')
  async getMyMenus(@Req() req) {
    const roles = req.user.roles;
    // Buscar todos los menús asociados a los roles del usuario
    const menus: Menu[] = await this.prisma.menus.findMany({
      where: {
        rolMenus: {
          some: {
            roles: {
              name: { in: roles },
              deletedAt: null,
            },
            deletedAt: null,
          },
        },
        active: true,
        deletedAt: null,
      },
    });

    // Convertir la lista plana de menús a un árbol
    function buildMenuTree(menuList: Menu[]): Menu[] {
      const menuMap = new Map<number, Menu & { children: Menu[] }>();
      menuList.forEach((menu) =>
        menuMap.set(menu.menusId, { ...menu, children: [] }),
      );
      const tree: Menu[] = [];
      menuMap.forEach((menu) => {
        if (menu.menusParentId && menuMap.has(menu.menusParentId)) {
          menuMap.get(menu.menusParentId)!.children!.push(menu);
        } else {
          tree.push(menu);
        }
      });
      return tree;
    }

    return buildMenuTree(menus);
  }
}
