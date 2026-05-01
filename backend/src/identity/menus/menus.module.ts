import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { GetMyMenusUseCase } from './use-cases/get-my-menus.use-case';

@Module({
  controllers: [MenusController],
  providers: [MenusService, GetMyMenusUseCase],
  imports: [UserModule],
  exports: [GetMyMenusUseCase],
})
export class MenusModule {}
