import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MenusService } from './menus.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('menus')
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) { }

  @Get('my')
  async getMyMenus(@Req() req) {
    const userId = req.user.sub;
    return this.menusService.getMyMenus(userId);
  }
}
