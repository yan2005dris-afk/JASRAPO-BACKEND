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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_user_dto_1 = require("./dto/login-user.dto");
const register_dto_1 = require("./dto/register.dto");
const jwt_refresh_guard_1 = require("./guards/jwt-refresh.guard");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
const swagger_1 = require("@nestjs/swagger");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(loginUserDto, req, res) {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        const existingRefreshToken = req.cookies?.refreshToken;
        const result = await this.authService.login(loginUserDto, ip, userAgent, existingRefreshToken);
        const refreshCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
        res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
        res.json({
            accessToken: result.accessToken,
            sid: result.sid,
            sub: result.sub,
            email: result.email,
            name: result.name,
            roleId: result.roleId,
            roleName: result.roleName,
            avatar: result.avatar,
            createdAt: result.accessTokenInfo.iatDate,
            expiresAt: result.accessTokenInfo.expDate,
        });
    }
    async refresh(req, res) {
        const { sessionsId } = req.user;
        const refreshToken = req.cookies?.refreshToken;
        const ip = req.ip ?? 'unknown';
        const userAgent = req.headers['user-agent'] ?? 'unknown';
        const tokens = await this.authService.refreshAccessToken(sessionsId, refreshToken, ip, userAgent, req.user?.email ?? '');
        const refreshCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
        res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
        res.json({
            message: 'Token refrescado correctamente',
            accessToken: tokens.accessToken,
        });
    }
    async logout(req, res) {
        const { sessionsId } = req.user;
        await this.authService.logout(sessionsId);
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.json({ message: 'Sesión cerrada correctamente' });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Registrar nuevo usuario',
        description: 'Crea un nuevo usuario en el sistema. Requiere permiso users:create.',
    }),
    (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto, description: 'Datos del usuario a registrar' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Usuario registrado exitosamente',
        schema: {
            example: {
                usersId: 1,
                email: 'nuevo@jasrapo.com',
                createdAt: '2024-01-15T10:30:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:create' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'El correo electrónico ya existe' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'create'),
    (0, common_1.Post)('register'),
    openapi.ApiResponse({ status: 201, type: String }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Iniciar sesión',
        description: 'Autentica al usuario y retorna un token de acceso JWT. El refreshToken se almacena en una cookie httpOnly.',
    }),
    (0, swagger_1.ApiBody)({
        type: login_user_dto_1.LoginUserDto,
        description: 'Credenciales del usuario (email y contraseña)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login exitoso',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                sid: 'session-id-123',
                sub: 1,
                email: 'admin@jasrapo.com',
                name: 'Admin',
                roleId: 1,
                roleName: 'Administrador',
                avatar: 'https://example.com/avatar.png',
                createdAt: '2024-01-15T10:30:00Z',
                expiresAt: '2024-01-15T11:30:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Credenciales inválidas' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Autenticación fallida' }),
    (0, common_1.Post)('/login'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_user_dto_1.LoginUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Refrescar token de acceso',
        description: 'Genera un nuevo token de acceso usando el refreshToken almacenado en cookies.',
    }),
    (0, swagger_1.ApiCookieAuth)('refreshToken'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refrescado exitosamente',
        schema: {
            example: {
                message: 'Token refrescado correctamente',
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Refresh token inválido o expirado' }),
    (0, common_1.UseGuards)(jwt_refresh_guard_1.JwtRefreshGuard),
    (0, common_1.Post)('refresh'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Cerrar sesión',
        description: 'Cierra la sesión actual del usuario y elimina el refreshToken de la cookie.',
    }),
    (0, swagger_1.ApiCookieAuth)('refreshToken'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sesión cerrada exitosamente',
        schema: {
            example: {
                message: 'Sesión cerrada correctamente',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, common_1.UseGuards)(jwt_refresh_guard_1.JwtRefreshGuard),
    (0, common_1.Post)('logout'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map