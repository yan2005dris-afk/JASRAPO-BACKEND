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
    (0, swagger_1.ApiOperation)({
        summary: 'Crear usuario',
        description: 'Crea un nuevo usuario con email y contraseña. El email debe ser único en el sistema.',
    }),
    (0, swagger_1.ApiBody)({
        type: create_user_dto_1.CreateUserDto,
        description: 'Datos del usuario a crear',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Usuario creado exitosamente',
        schema: {
            example: {
                usersId: 1,
                email: 'nuevo@jasrapo.com',
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-15T10:30:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'No autorizado - Token inválido o expirado',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:create' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflicto - El email ya existe' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'create'),
    (0, common_1.Post)('/'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Listar usuarios',
        description: 'Retorna una lista paginada de usuarios. Si no se especifican parámetros de paginación, retorna todos los usuarios.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'skip',
        description: 'Número de registros a omitir (para paginación)',
        required: false,
        example: 0,
        type: Number,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'take',
        description: 'Número máximo de registros a retornar',
        required: false,
        example: 10,
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de usuarios obtenida exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:read' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
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
        description: 'Retorna los datos de un usuario específico, incluyendo sus roles y permisos asignados.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario encontrado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener roles de usuario',
        description: 'Retorna los roles asignados a un usuario específico, sin incluir información de la relación.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Roles del usuario obtenidos exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
    (0, common_1.Get)(':id/roles'),
    openapi.ApiResponse({ status: 200, type: [String] }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserRoles", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener asignaciones de rol de usuario',
        description: 'Retorna los roles asignados a un usuario con información de la relación (userRolesId), necesario para revocar roles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Asignaciones de rol obtenidas exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
    (0, common_1.Get)(':id/role-assignments'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserRoleAssignments", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar usuario',
        description: 'Actualiza los datos básicos de un usuario (email o contraseña).',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario a actualizar',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiBody)({
        type: update_user_dto_1.UpdateUserDto,
        description: 'Datos a actualizar (email y/o password)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario actualizado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:update' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'update'),
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Asignar rol a usuario',
        description: 'Asigna un rol adicional a un usuario existente. No elimina los roles anteriores.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiBody)({
        type: assign_role_dto_1.AssignRoleDto,
        description: 'ID del rol a asignar',
        examples: {
            ejemplo1: {
                value: { rolesId: 2 },
                summary: 'Asignar rol de Editor',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Rol asignado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:update' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario o rol no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'update'),
    (0, common_1.Post)(':id/roles'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_role_dto_1.AssignRoleDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "assignRole", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener permisos directos del usuario',
        description: 'Retorna los permisos asignados directamente al usuario, sin incluir los heredados por roles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permisos directos del usuario obtenidos exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
    (0, common_1.Get)(':id/permissions'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserPermissions", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Asignar permiso directo a usuario',
        description: 'Asigna un permiso directo a un usuario sin pasar por un rol. Útil para permisos específicos.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiBody)({
        type: assign_permission_dto_1.AssignPermissionDto,
        description: 'ID del permiso a asignar y opción allow',
        examples: {
            ejemplo1: {
                value: { permissionsId: 1, allow: true },
                summary: 'Permitir permiso',
            },
            ejemplo2: {
                value: { permissionsId: 1, allow: false },
                summary: 'Revocar permiso',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Permiso asignado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:update' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario o permiso no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'update'),
    (0, common_1.Post)(':id/permissions'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_permission_dto_1.AssignPermissionDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "assignPermission", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Revocar rol de usuario',
        description: 'Revoca (soft delete) un rol asignado a un usuario. El userRoleId es el ID de la relación en users_roles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiParam)({
        name: 'userRoleId',
        description: 'ID de la relación usuario-rol (users_roles)',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rol revocado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:delete' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Relación usuario-rol no encontrada' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'delete'),
    (0, common_1.Delete)(':id/roles/:userRoleId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('userRoleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "revokeRole", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar usuario',
        description: 'Marca un usuario como eliminado (soft delete). El usuario no se borra permanentemente de la base de datos.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario a eliminar',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario eliminado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:delete' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'delete'),
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Revocar permiso directo de usuario',
        description: 'Revoca (soft delete) un permiso asignado directamente a un usuario. El userPermissionId es el ID de la relación.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del usuario',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiParam)({
        name: 'userPermissionId',
        description: 'ID de la relación usuario-permiso (users_permissions)',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permiso revocado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:delete' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Relación usuario-permiso no encontrada' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'delete'),
    (0, common_1.Delete)(':id/permissions/:userPermissionId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('userPermissionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "revokePermission", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener permisos efectivos del usuario',
        description: 'Retorna la lista de permisos efectivos de un usuario, incluyendo permisos directos y heredados por roles.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'usersId',
        description: 'ID único del usuario',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permisos efectivos obtenidos exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso users:read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('users', 'read'),
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