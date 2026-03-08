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
exports.RolesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const roles_service_1 = require("./roles.service");
const create_role_dto_1 = require("./dto/create-role.dto");
const update_role_dto_1 = require("./dto/update-role.dto");
const assign_role_permission_dto_1 = require("./dto/assign-role-permission.dto");
const set_role_children_dto_1 = require("./dto/set-role-children.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const swagger_1 = require("@nestjs/swagger");
let RolesController = class RolesController {
    rolesService;
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    create(createRoleDto) {
        return this.rolesService.create(createRoleDto);
    }
    findAll() {
        return this.rolesService.findAll();
    }
    findOne(id) {
        return this.rolesService.findOne(+id);
    }
    update(id, updateRoleDto) {
        return this.rolesService.update(+id, updateRoleDto);
    }
    getRolePermissions(id) {
        return this.rolesService.getRolePermissions(+id);
    }
    getRoleChildren(id) {
        return this.rolesService.getRoleChildren(+id);
    }
    setRoleChildren(id, dto) {
        return this.rolesService.setRoleChildren(+id, dto);
    }
    assignPermission(id, assignRolePermissionDto) {
        return this.rolesService.assignPermission(+id, assignRolePermissionDto.permissionsId);
    }
    removePermission(id, permissionId) {
        return this.rolesService.removePermission(+id, +permissionId);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Crear rol',
        description: 'Crea un nuevo rol en el sistema.',
    }),
    (0, swagger_1.ApiBody)({
        type: create_role_dto_1.CreateRoleDto,
        description: 'Datos del rol a crear',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Rol creado exitosamente',
        schema: {
            example: {
                rolesId: 1,
                name: 'Administrador',
                createdAt: '2024-01-15T10:30:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso roles:create' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflicto - El rol ya existe' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'create'),
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_dto_1.CreateRoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Listar roles',
        description: 'Retorna todos los roles registrados en el sistema.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de roles obtenida exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso roles:read' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'read'),
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener rol por ID',
        description: 'Retorna los datos de un rol específico.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del rol',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rol encontrado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso roles:read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'read'),
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar rol',
        description: 'Actualiza el nombre de un rol existente.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del rol a actualizar',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiBody)({
        type: update_role_dto_1.UpdateRoleDto,
        description: 'Datos a actualizar (nombre del rol)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rol actualizado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso roles:update' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'update'),
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener permisos efectivos de un rol',
        description: 'Retorna todos los permisos efectivos de un rol, incluyendo los heredados de roles hijos (jerarquía completa). ' +
            'Los permisos se deduplicado automáticamente.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del rol',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permisos del rol obtenidos exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso roles:read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'read'),
    (0, common_1.Get)(':id/permissions'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "getRolePermissions", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener roles hijos de un rol',
        description: 'Lista los roles hijos heredados directamente por el rol padre. ' +
            'Útil para visualizar la jerarquía de herencia de permisos.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del rol padre',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de roles hijos obtenida exitosamente',
        schema: {
            example: [
                { roleHierarchyId: 1, childRoleId: 5, childRoleName: 'operadores' },
                { roleHierarchyId: 2, childRoleId: 6, childRoleName: 'contabilidad' },
            ],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso roles:read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'read'),
    (0, common_1.Get)(':id/children'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "getRoleChildren", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Configurar roles hijos de un rol',
        description: 'Reemplaza la lista de roles hijos heredados por el rol padre. ' +
            'Los enlaces que ya no estén en la lista se eliminan lógicamente (soft delete) ' +
            'y los nuevos se crean. El rol padre heredará los permisos de todos sus hijos.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del rol padre',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiBody)({
        type: set_role_children_dto_1.SetRoleChildrenDto,
        description: 'Lista de IDs de roles hijos a asignar',
        examples: {
            ejemplo1: {
                value: { childRoleIds: [5, 6] },
                summary: 'Asignar operadores y contabilidad como hijos',
            },
            ejemplo2: {
                value: { childRoleIds: [] },
                summary: 'Remover todos los roles hijos',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Roles hijos actualizados exitosamente',
        schema: {
            example: [
                { roleHierarchyId: 1, childRoleId: 5, childRole: { name: 'operadores' } },
                { roleHierarchyId: 2, childRoleId: 6, childRole: { name: 'contabilidad' } },
            ],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso roles:update' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol padre o algún rol hijo no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'update'),
    (0, common_1.Patch)(':id/children'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_role_children_dto_1.SetRoleChildrenDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "setRoleChildren", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Asignar permiso a rol',
        description: 'Asigna un permiso a un rol existente.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del rol',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiBody)({
        type: assign_role_permission_dto_1.AssignRolePermissionDto,
        description: 'ID del permiso a asignar',
        examples: {
            ejemplo1: {
                value: { permissionsId: 1 },
                summary: 'Asignar permiso de lectura',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Permiso asignado exitosamente al rol',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso roles:update' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol o permiso no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'update'),
    (0, common_1.Post)(':id/permissions'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_role_permission_dto_1.AssignRolePermissionDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "assignPermission", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Revocar permiso de rol',
        description: 'Revoca (soft delete) un permiso asignado a un rol.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del rol',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiParam)({
        name: 'permissionId',
        description: 'ID del permiso a revocar',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permiso revocado exitosamente del rol',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso roles:delete' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Relación rol-permiso no encontrada' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'delete'),
    (0, common_1.Patch)(':id/permissions/:permissionId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('permissionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "removePermission", null);
exports.RolesController = RolesController = __decorate([
    (0, swagger_1.ApiTags)('roles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map