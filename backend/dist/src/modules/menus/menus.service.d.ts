import { PrismaService } from 'src/database/prisma.service';
import { UserService } from '../user/user.service';
import { MenuResponseDto } from './dto/response-menu.dto';
export declare class MenusService {
    private readonly prisma;
    private readonly userService;
    constructor(prisma: PrismaService, userService: UserService);
    getMyMenus(userId: number): Promise<MenuResponseDto[]>;
    private buildMenuTree;
}
