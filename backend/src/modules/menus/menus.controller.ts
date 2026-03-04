import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MenusService } from './menus.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { MenuResponseDto } from './dto/response-menu.dto';
import type { JwtRequest } from 'src/auth/types/JwtRequest.types';

@ApiTags('menus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}
  @ApiParam({
    name: 'userId',
    type: Number,
    description:
      'ID del usuario, pero esta se obtiene a partir de la request cuando se verifica el jwt, no se pasa como parametro en la ruta',
  })
  @Get('my')
  async getMyMenus(@Req() req: JwtRequest): Promise<MenuResponseDto[]> {
    const userId = req.user.sub;
    return this.menusService.getMyMenus(userId);
  }
}
