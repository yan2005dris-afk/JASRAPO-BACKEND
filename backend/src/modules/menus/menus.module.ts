import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  controllers: [MenusController],
  providers: [MenusService],
  imports: [UserModule],
})
export class MenusModule {}
