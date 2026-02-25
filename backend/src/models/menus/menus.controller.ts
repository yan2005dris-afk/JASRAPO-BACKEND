import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PrismaService } from 'src/database/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly prisma: PrismaService) {}
  /*
  @Get('my')
  async getMyMenus(@Req() req) {
    return this.menusService.getMyMenus(req.user.userId);
  }
    */
}
