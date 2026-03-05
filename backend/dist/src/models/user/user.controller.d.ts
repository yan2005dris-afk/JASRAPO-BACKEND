import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): any;
    findAll(skip?: number, take?: number): any;
    findOne(id: number): any;
    update(id: number, updateUserDto: UpdateUserDto): any;
    updateUserRole(id: number, updateUserRoleDto: UpdateUserRoleDto): any;
    remove(id: number): any;
    getEffectivePermissions(usersId: number): any;
}
