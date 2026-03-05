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
var PermissionsGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
let PermissionsGuard = PermissionsGuard_1 = class PermissionsGuard {
    reflector;
    logger = new common_1.Logger(PermissionsGuard_1.name);
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const required = this.reflector.get(require_permission_decorator_1.PERMISSION_KEY, context.getHandler());
        if (!required)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.usersId) {
            this.logger.error('Usuario no identificado en request.user');
            throw new common_1.ForbiddenException('Usuario no identificado');
        }
        const permissions = user.permissions ?? [];
        const hasPermission = permissions.some((p) => p.resource === required.resource && p.action === required.action);
        if (!hasPermission) {
            throw new common_1.ForbiddenException(`${user.email} no tiene permiso para la acción "${required.action}" en "${required.resource}"`);
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = PermissionsGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map