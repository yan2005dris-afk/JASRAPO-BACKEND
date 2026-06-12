import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { MenusController } from './interfaces/http/menus.controller';
import { MenusService } from './application/menus.service';
import { GetMyMenusUseCase } from './application/use-cases/get-my-menus.use-case';
import { MenuRepository } from './domain/repositories/menu.repository';
import { PrismaMenuRepository } from './infrastructure/repositories/prisma-menu.repository';

@Module({
  controllers: [MenusController],
  providers: [
    MenusService,
    GetMyMenusUseCase,
    {
      provide: MenuRepository,
      useClass: PrismaMenuRepository,
    },
  ],
  imports: [UserModule],
  exports: [GetMyMenusUseCase, MenuRepository],
})
export class MenusModule {}
