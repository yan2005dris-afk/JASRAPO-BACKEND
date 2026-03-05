import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MenusService } from './menus.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MenuResponseDto } from './dto/response-menu.dto';
import type { JwtRequest } from 'src/auth/types/JwtRequest.types';

@ApiTags('menus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}
  @ApiOperation({
    summary:
      'Obtener los menús disponibles para el usuario autenticado, a partir del user.sub que se obtiene en el JWT.',
  })
  @Get('my')
  async getMyMenus(@Req() req: JwtRequest): Promise<MenuResponseDto[]> {
    const userId = req.user.sub;
    return this.menusService.getMyMenus(userId);
  }
}
