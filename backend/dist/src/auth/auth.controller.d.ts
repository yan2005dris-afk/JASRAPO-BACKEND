import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<string>;
    login(loginUserDto: LoginUserDto, req: any, res: any): Promise<void>;
    refresh(req: any, res: any): Promise<void>;
    logout(req: any, res: any): Promise<void>;
}
