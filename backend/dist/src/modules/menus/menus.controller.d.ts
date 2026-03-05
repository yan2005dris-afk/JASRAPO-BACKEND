import { MenusService } from './menus.service';
import { MenuResponseDto } from './dto/response-menu.dto';
import type { JwtRequest } from 'src/auth/types/JwtRequest.types';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    getMyMenus(req: JwtRequest): Promise<MenuResponseDto[]>;
}
