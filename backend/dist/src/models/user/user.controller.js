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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const update_user_role_dto_1 = require("./dto/update-user-role.dto");
const user_service_1 = require("./user.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("src/auth/guards/permissions.guard");
const require_permission_decorator_1 = require("src/auth/decorators/require-permission.decorator");
const swagger_1 = require("@nestjs/swagger");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    create(createUserDto) {
        return this.userService.createUser(createUserDto);
    }
    findAll(skip, take) {
        return this.userService.users({
            skip: skip ?? undefined,
            take: take ?? undefined,
        });
    }
    findOne(id) {
        return this.userService.user({ usersId: id });
    }
    update(id, updateUserDto) {
        return this.userService.updateUser({
            where: { usersId: id },
            data: {
                email: updateUserDto.email,
                password: updateUserDto.password,
            },
        });
    }
    updateUserRole(id, updateUserRoleDto) {
        return this.userService.updateUserRole({
            usersRolesId: updateUserRoleDto.usersRolesId,
            rolesId: updateUserRoleDto.rolesId,
            deletedAt: updateUserRoleDto.deletedAt,
        });
    }
    remove(id) {
        return this.userService.deleteUser({ usersId: id });
    }
    getEffectivePermissions(usersId) {
        return this.userService.getEffectivePermissions(usersId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Crear un nuevo usuario',
        description: 'Crea un usuario en el sistema. Requiere permiso de creación de usuarios.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usuario creado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Sin permisos suficientes' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'El usuario ya existe' }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'create'),
    (0, common_1.Post)('/'),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener todos los usuarios',
        description: 'Retorna una lista paginada de usuarios. Soporta paginación con skip y take.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de usuarios obtenida exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', description: 'Número de registros a omitir (para paginación)', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', description: 'Número de registros a retornar (para paginación)', required: false, type: Number }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
    (0, common_1.Get)('/'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener un usuario por ID',
        description: 'Retorna los datos de un usuario específico'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuario encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario', type: 'integer' }),
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar un usuario',
        description: 'Actualiza los datos de un usuario existente (email y/o contraseña)'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuario actualizado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario a actualizar', type: 'integer' }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateUserDto }),
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof update_user_dto_1.UpdateUserDto !== "undefined" && update_user_dto_1.UpdateUserDto) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar el rol de un usuario',
        description: 'Asigna o cambia el rol de un usuario específico'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rol de usuario actualizado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario o relación no encontrada' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario', type: 'integer' }),
    (0, swagger_1.ApiBody)({ type: update_user_role_dto_1.UpdateUserRoleDto }),
    (0, common_1.Patch)(':id/role'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof update_user_role_dto_1.UpdateUserRoleDto !== "undefined" && update_user_role_dto_1.UpdateUserRoleDto) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateUserRole", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar un usuario',
        description: 'Elimina (soft delete) un usuario del sistema'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuario eliminado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario a eliminar', type: 'integer' }),
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener permisos efectivos del usuario',
        description: 'Retorna todos los permisos efectivos de un usuario (directos y heredados por rol)'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permisos obtenidos exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, swagger_1.ApiParam)({ name: 'usersId', description: 'ID del usuario', type: 'integer' }),
    (0, common_1.Get)('getEffectivePermissions/:usersId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('usersId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getEffectivePermissions", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object])
], UserController);
//# sourceMappingURL=user.controller.js.map