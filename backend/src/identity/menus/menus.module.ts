import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { MenusController } from './interfaces/http/menus.controller';
import { MenusService } from './application/services/menus.service';
import { GetMyMenusUseCase } from './application/use-cases/get-my-menus.use-case';

@Module({
  controllers: [MenusController],
  providers: [MenusService, GetMyMenusUseCase],
  imports: [UserModule],
  exports: [GetMyMenusUseCase],
})
export class MenusModule {}
