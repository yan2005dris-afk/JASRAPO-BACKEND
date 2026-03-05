import { MenusService } from './menus.service';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    getMyMenus(req: any): Promise<any>;
}
