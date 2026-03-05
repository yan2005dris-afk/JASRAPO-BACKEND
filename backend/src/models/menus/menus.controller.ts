import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MenusService } from './menus.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MenuResponseDto } from './dto/response-menu.dto';

@ApiTags('menus')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) { }

  @ApiOperation({ 
    summary: 'Obtener menús del usuario autenticado', 
    description: 'Retorna la lista de menús disponibles para el usuario actualmente autenticado, basados en sus permisos y roles. Los menús se devuelven en formato de árbol jerárquico.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Menús obtenidos exitosamente',
    type: [MenuResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido o expirado' })
  @Get('my')
  async getMyMenus(@Req() req) {
    const userId = req.user.sub;
    return this.menusService.getMyMenus(userId);
  }
}

