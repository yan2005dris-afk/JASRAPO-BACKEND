import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/identity/auth/guards/jwt-auth.guard';
import { MenusService } from './menus.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MenuResponseDto } from './dto/response-menu.dto';
import type { JwtRequest } from 'src/identity/auth/types/JwtRequest.types';

@ApiTags('menus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  /**
   * Obtiene los menús disponibles para el usuario autenticado.
   * Los menús se filtran según los permisos del usuario extraídos del JWT.
   */
  @ApiOperation({
    summary: 'Obtener menús del usuario autenticado',
    description:
      'Retorna los menús disponibles para el usuario actual, basados en sus roles y permisos. El user.sub se obtiene del JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Menús obtenidos exitosamente',
    type: [MenuResponseDto],
    schema: {
      example: [
        {
          id: 1,
          name: 'Dashboard',
          path: '/dashboard',
          icon: 'dashboard',
          children: [],
        },
        {
          id: 2,
          name: 'Usuarios',
          path: '/users',
          icon: 'people',
          children: [
            { id: 3, name: 'Listar Usuarios', path: '/users/list', icon: null },
            { id: 4, name: 'Crear Usuario', path: '/users/create', icon: null },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @Get('my')
  async getMyMenus(@Req() req: JwtRequest): Promise<MenuResponseDto[]> {
    const userId = req.user.sub;
    return this.menusService.getMyMenus(userId);
  }
}
