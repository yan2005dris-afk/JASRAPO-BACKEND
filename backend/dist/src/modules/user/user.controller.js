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
exports.UserController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const assign_role_dto_1 = require("./dto/assign-role.dto");
const assign_permission_dto_1 = require("./dto/assign-permission.dto");
const user_service_1 = require("./user.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
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
    getUserRoles(id) {
        return this.userService.getRolesByUserId(id);
    }
    getUserRoleAssignments(id) {
        return this.userService.getRoleAssignmentsByUserId(id);
    }
    updateUser(id, updateUserDto) {
        return this.userService.updateUser({
            where: { usersId: id },
            data: {
                email: updateUserDto.email,
                password: updateUserDto.password,
            },
        });
    }
    assignRole(id, assignRoleDto) {
        return this.userService.assignRoleToUser(id, assignRoleDto.rolesId);
    }
    getUserPermissions(id) {
        return this.userService.getDirectPermissionsByUserId(id);
    }
    assignPermission(id, assignPermissionDto) {
        return this.userService.assignPermissionToUser(id, assignPermissionDto.permissionsId, assignPermissionDto.allow ?? true);
    }
    revokeRole(userRolesId) {
        return this.userService.revokeRoleFromUser(userRolesId);
    }
    remove(id) {
        return this.userService.softDeleteUser({ usersId: id });
    }
    revokePermission(userPermissionId) {
        return this.userService.revokePermissionFromUser(userPermissionId);
    }
    getEffectivePermissions(usersId) {
        return this.userService.getEffectivePermissions(usersId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear un nuevo usuario',
        description: 'Crea un nuevo usuario en el sistema con email y contraseña.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Usuario creado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Datos inválidos o email ya existe',
    }),
    (0, common_1.Post)('/'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener todos los usuarios',
        description: 'Retorna una lista paginada de usuarios.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'skip',
        description: 'Número de registros a omitir (paginación)',
        required: false,
        type: Number,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'take',
        description: 'Límite de registros a retornar',
        required: false,
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de usuarios',
    }),
    (0, common_1.Get)('/'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener usuario por ID',
        description: 'Retorna un usuario específico por su ID.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario encontrado',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario no encontrado',
    }),
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener roles de usuario',
        description: 'Retorna los roles asignados a un usuario específico.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de roles del usuario',
    }),
    (0, common_1.Get)(':id/roles'),
    openapi.ApiResponse({ status: 200, type: [String] }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserRoles", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener asignaciones de rol',
        description: 'Retorna los roles asignados con información de la relación (userRolesId).',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de asignaciones de rol',
    }),
    (0, common_1.Get)(':id/role-assignments'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserRoleAssignments", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'update'),
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar usuario',
        description: 'Actualiza los datos de un usuario (email o contraseña).',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario actualizado',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario no encontrado',
    }),
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'update'),
    (0, swagger_1.ApiOperation)({
        summary: 'Asignar rol a usuario',
        description: 'Asigna un rol adicional a un usuario existente.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Rol asignado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario o rol no encontrado',
    }),
    (0, common_1.Post)(':id/roles'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_role_dto_1.AssignRoleDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "assignRole", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener permisos directos del usuario',
        description: 'Retorna los permisos asignados directamente al usuario (no heredados).',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de permisos directos',
    }),
    (0, common_1.Get)(':id/permissions'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserPermissions", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'update'),
    (0, swagger_1.ApiOperation)({
        summary: 'Asignar permiso directo a usuario',
        description: 'Asigna un permiso directo a un usuario sin pasar por un rol.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Permiso asignado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario o permiso no encontrado',
    }),
    (0, common_1.Post)(':id/permissions'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_permission_dto_1.AssignPermissionDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "assignPermission", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'delete'),
    (0, swagger_1.ApiOperation)({
        summary: 'Revocar rol de usuario',
        description: 'Revoca (soft delete) un rol asignado a un usuario. El userRoleId es el ID de la relación.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userRoleId',
        description: 'ID de la relación usuario-rol',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rol revocado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Asignación de rol no encontrada',
    }),
    (0, common_1.Delete)(':id/roles/:userRoleId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('userRoleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "revokeRole", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'delete'),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar usuario',
        description: 'Revoca (soft delete) un usuario completo, incluyendo sus roles y permisos.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario eliminado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario no encontrado',
    }),
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'delete'),
    (0, swagger_1.ApiOperation)({
        summary: 'Revocar permiso directo de usuario',
        description: 'Revoca (soft delete) un permiso asignado directamente a un usuario.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userPermissionId',
        description: 'ID de la relación usuario-permiso',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permiso revocado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Permiso no encontrado',
    }),
    (0, common_1.Delete)(':id/permissions/:userPermissionId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('userPermissionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "revokePermission", null);
__decorate([
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener permisos efectivos del usuario',
        description: 'Retorna todos los permisos efectivos (directos + heredados de roles).',
    }),
    (0, swagger_1.ApiParam)({
        name: 'usersId',
        description: 'ID único del usuario',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de permisos efectivos',
    }),
    (0, common_1.Get)('getEffectivePermissions:id/effective-permissions'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('usersId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getEffectivePermissions", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map