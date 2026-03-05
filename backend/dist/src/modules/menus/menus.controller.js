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
exports.MenusController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const menus_service_1 = require("./menus.service");
const swagger_1 = require("@nestjs/swagger");
const response_menu_dto_1 = require("./dto/response-menu.dto");
let MenusController = class MenusController {
    menusService;
    constructor(menusService) {
        this.menusService = menusService;
    }
    async getMyMenus(req) {
        const userId = req.user.sub;
        return this.menusService.getMyMenus(userId);
    }
};
exports.MenusController = MenusController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener menús del usuario',
        description: 'Retorna los menús disponibles para el usuario autenticado, basados en sus roles y permisos.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de menús disponibles para el usuario',
        type: [response_menu_dto_1.MenuResponseDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'No autorizado',
    }),
    (0, common_1.Get)('my'),
    openapi.ApiResponse({ status: 200, type: [require("./dto/response-menu.dto").MenuResponseDto] }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenusController.prototype, "getMyMenus", null);
exports.MenusController = MenusController = __decorate([
    (0, swagger_1.ApiTags)('menus'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('menus'),
    __metadata("design:paramtypes", [menus_service_1.MenusService])
], MenusController);
//# sourceMappingURL=menus.controller.js.map