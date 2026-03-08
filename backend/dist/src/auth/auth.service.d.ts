import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from 'src/modules/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly userService;
    private readonly prisma;
    private readonly jwtService;
    private readonly config;
    private readonly logger;
    constructor(userService: UserService, prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    register({ email, password }: RegisterDto): Promise<string>;
    login(loginUserDto: LoginUserDto, ip?: string, userAgent?: string, existingRefreshToken?: string): Promise<{
        sub: number;
        sid: number;
        name: string | null;
        avatar: any;
        email: string;
        roleId: number | null;
        roleName: string | null;
        roles: number[];
        accessToken: string;
        refreshToken: string;
        accessTokenInfo: {
            iat: any;
            exp: any;
            iatDate: string | null;
            expDate: string | null;
        };
        refreshTokenInfo: {
            iat: any;
            exp: any;
            iatDate: string | null;
            expDate: string | null;
        };
    }>;
    private buildLoginResponse;
    private actualizarSesionTokens;
    private generateJwtToken;
    refreshAccessToken(sessionId: number, refreshToken: string, ip?: string, userAgent?: string, email?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(sessionId: number): Promise<void>;
    validateUser(loginUserDto: LoginUserDto): Promise<{
        deletedAt: Date | null;
        rolesId: number | null;
        usersId: number;
        email: string;
    }>;
}
