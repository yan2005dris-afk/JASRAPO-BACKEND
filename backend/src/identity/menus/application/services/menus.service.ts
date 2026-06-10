import { Injectable } from '@nestjs/common';
import { MenuResponseDto } from '../../interfaces/dto/response-menu.dto';
import { GetMyMenusUseCase } from '../use-cases/get-my-menus.use-case';

@Injectable()
export class MenusService {
  constructor(private readonly getMyMenusUseCase: GetMyMenusUseCase) {}

  async getMyMenus(userId: number): Promise<MenuResponseDto[]> {
    return this.getMyMenusUseCase.execute(userId);
  }
}
