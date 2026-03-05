"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const config_1 = require("@nestjs/config");
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const prisma_service_1 = require("../../database/prisma.service");
const common_1 = require("@nestjs/common");
const user_service_1 = require("../../modules/user/user.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    prisma;
    config;
    userService;
    constructor(prisma, config, userService) {
        const secret = config.get('JWT_ACCESS_SECRET');
        if (!secret) {
            throw new common_1.UnauthorizedException('Session invalida');
        }
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
            ignoreExpiration: false,
        });
        this.prisma = prisma;
        this.config = config;
        this.userService = userService;
    }
    async validate(payload) {
        const { sub: usersId, sid: sessionsId, email } = payload;
        if (!usersId || !sessionsId) {
            throw new common_1.UnauthorizedException('Session invalida');
        }
        const session = await this.prisma.sessions.findUnique({
            where: { sessionsId },
        });
        if (!session || session.isRevoked || session.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Sesión inválida o expirada');
        }
        const permissions = await this.userService.getEffectivePermissions(usersId);
        return {
            sub: usersId,
            usersId,
            sid: sessionsId,
            email,
            permissions,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        user_service_1.UserService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map