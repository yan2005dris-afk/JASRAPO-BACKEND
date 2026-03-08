"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const ecuador_timezone_backend_util_1 = require("../common/util/ecuador-timezone-backend.util");
const prisma_service_1 = require("../database/prisma.service");
const user_service_1 = require("../modules/user/user.service");
let AuthService = AuthService_1 = class AuthService {
    userService;
    prisma;
    jwtService;
    config;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(userService, prisma, jwtService, config) {
        this.userService = userService;
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
    async register({ email, password }) {
        const user = await this.userService.user({ email });
        if (user) {
            throw new common_1.BadRequestException('El correo ya está registrado');
        }
        const newUser = await this.userService.createUser({
            email,
            password: await bcrypt.hash(password, 10),
        });
        if (newUser) {
            return 'El registro fue exitoso';
        }
        else {
            throw new common_1.BadRequestException('Error al registrar el usuario');
        }
    }
    async login(loginUserDto, ip, userAgent, existingRefreshToken) {
        const users = await this.validateUser(loginUserDto);
        const safeIp = ip ?? 'unknown';
        const safeAgent = userAgent ?? 'unknown';
        this.logger.log(`[LOGIN] user=${users.usersId} | ip="${safeIp}"`);
        if (existingRefreshToken) {
            this.logger.debug(`[LOGIN] cookie refreshToken (primeros 20 chars): "${existingRefreshToken.substring(0, 20)}..."`);
            this.logger.debug(`[LOGIN] userAgent buscado: "${safeAgent}"`);
            const existingSession = await this.prisma.sessions.findFirst({
                where: {
                    usersId: users.usersId,
                    userAgent: safeAgent,
                    isRevoked: false,
                    expiresAt: { gt: new Date() },
                },
                orderBy: { sessionsId: 'desc' },
            });
            if (existingSession) {
                const isValid = await bcrypt.compare(existingRefreshToken, existingSession.refreshToken);
                if (isValid) {
                    const tokens = await this.actualizarSesionTokens({ ...existingSession, email: users.email }, { ipAddress: safeIp, userAgent: safeAgent });
                    return this.buildLoginResponse(users, existingSession.sessionsId, tokens);
                }
            }
        }
        const session = await this.prisma.sessions.create({
            data: {
                usersId: users.usersId,
                refreshToken: '',
                ipAddress: safeIp,
                userAgent: safeAgent,
                isRevoked: false,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        const tokens = await this.actualizarSesionTokens({
            ...session,
            email: users.email,
        });
        return this.buildLoginResponse(users, session.sessionsId, tokens);
    }
    async buildLoginResponse(users, sessionsId, tokens) {
        const { accessToken, refreshToken } = tokens;
        const decodedAccess = this.jwtService.decode(accessToken);
        const decodedRefresh = this.jwtService.decode(refreshToken);
        const [userWithRole, profile] = await Promise.all([
            this.prisma.users.findUnique({
                where: { usersId: users.usersId },
                select: {
                    rolesId: true,
                    role: { select: { name: true, deletedAt: true } },
                },
            }),
            this.prisma.profiles.findUnique({
                where: { usersId: users.usersId },
                select: { firstName: true, lastName: true, avatar: true },
            }),
        ]);
        const nameParts = [profile?.firstName, profile?.lastName].filter(Boolean);
        const fullName = nameParts.length > 0 ? nameParts.join(' ') : null;
        const avatarMeta = profile?.avatar;
        const avatarKey = avatarMeta?.key ?? null;
        const firstRole = userWithRole?.role && !userWithRole.role.deletedAt
            ? { rolesId: userWithRole.rolesId, name: userWithRole.role.name }
            : null;
        const toDate = (ts) => ts ? ecuador_timezone_backend_util_1.EcuadorTimezoneUtil.formatAsEcuadorISO(new Date(ts * 1000)) : null;
        return {
            sub: users.usersId,
            sid: sessionsId,
            name: fullName,
            avatar: avatarKey,
            email: users.email,
            roleId: firstRole?.rolesId ?? null,
            roleName: firstRole?.name ?? null,
            roles: firstRole?.rolesId ? [firstRole.rolesId] : [],
            accessToken,
            refreshToken,
            accessTokenInfo: {
                iat: decodedAccess?.iat,
                exp: decodedAccess?.exp,
                iatDate: toDate(decodedAccess?.iat),
                expDate: toDate(decodedAccess?.exp),
            },
            refreshTokenInfo: {
                iat: decodedRefresh?.iat,
                exp: decodedRefresh?.exp,
                iatDate: toDate(decodedRefresh?.iat),
                expDate: toDate(decodedRefresh?.exp),
            },
        };
    }
    async actualizarSesionTokens(session, extraData = {}) {
        const tokens = await this.generateJwtToken(session.usersId, session.sessionsId, session.email ?? '');
        const newHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.prisma.sessions.update({
            where: { sessionsId: session.sessionsId },
            data: { refreshToken: newHash, ...extraData },
        });
        return tokens;
    }
    async generateJwtToken(userId, sessionId, email) {
        const payload = { sub: userId, sid: sessionId, email };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.config.get('JWT_ACCESS_SECRET'),
            expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'),
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
        });
        return { accessToken, refreshToken };
    }
    async refreshAccessToken(sessionId, refreshToken, ip = 'unknown', userAgent = 'unknown', email = '') {
        const session = await this.prisma.sessions.findUnique({
            where: { sessionsId: sessionId },
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Sesión no encontrada');
        }
        if (session.isRevoked) {
            throw new common_1.UnauthorizedException('La sesión ha sido revocada');
        }
        if (session.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('La sesión ha expirado');
        }
        const isValid = await bcrypt.compare(refreshToken, session.refreshToken);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Refresh token inválido');
        }
        return this.actualizarSesionTokens({ ...session, email }, { ipAddress: ip, userAgent });
    }
    async logout(sessionId) {
        await this.prisma.sessions.update({
            where: { sessionsId: sessionId },
            data: { isRevoked: true },
        });
    }
    async validateUser(loginUserDto) {
        const { email, password } = loginUserDto;
        const user = await this.prisma.users.findUnique({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (user.deletedAt) {
            throw new common_1.UnauthorizedException('Usuario eliminado');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const { password: _, ...safeUser } = user;
        return safeUser;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map