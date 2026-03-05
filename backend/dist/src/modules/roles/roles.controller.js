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
    assignPermission(id, assignRolePermissionDto) {
        return this.rolesService.assignPermission(+id, assignRolePermissionDto.permissionsId);
    }
    removePermission(id, permissionId) {
        return this.rolesService.removePermission(+id, +permissionId);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo rol', description: 'Crea un nuevo rol en el sistema con el nombre y descripción especificados.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Rol creado exitosamente. Retorna el objeto del rol creado.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos. Verifica el formato de los datos enviados.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Autenticación requerida. Token JWT inválido o expirado.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permisos insuficientes. No tienes permiso para crear roles.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflicto de datos. Ya existe un rol con el mismo nombre.' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'create'),
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_dto_1.CreateRoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los roles', description: 'Retorna una lista de todos los roles disponibles en el sistema.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de roles obtenida exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Autenticación requerida. Token JWT inválido o expirado.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permisos insuficientes. No tienes permiso para ver roles.' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'read'),
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un rol por ID', description: 'Retorna los detalles de un rol específico mediante su ID.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID único del rol', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rol encontrado exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Autenticación requerida. Token JWT inválido o expirado.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permisos insuficientes. No tienes permiso para ver roles.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol no encontrado. El ID especificado no corresponde a ningún rol.' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'read'),
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un rol', description: 'Actualiza los datos de un rol existente (nombre, descripción, estado).' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID único del rol a actualizar', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rol actualizado exitosamente. Retorna el objeto del rol actualizado.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos. Verifica el formato de los datos enviados.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Autenticación requerida. Token JWT inválido o expirado.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permisos insuficientes. No tienes permiso para actualizar roles.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol no encontrado. El ID especificado no corresponde a ningún rol.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflicto de datos. Ya existe un rol con el mismo nombre.' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'update'),
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obtener permisos de un rol', description: 'Retorna la lista de permisos asociados a un rol específico.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID único del rol', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de permisos del rol obtenida exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Autenticación requerida. Token JWT inválido o expirado.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permisos insuficientes. No tienes permiso para ver permisos.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol no encontrado. El ID especificado no corresponde a ningún rol.' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'read'),
    (0, common_1.Get)(':id/permissions'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "getRolePermissions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Asignar permiso a un rol', description: 'Asigna un permiso específico a un rol existente.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID único del rol', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Permiso asignado al rol exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos. El permissionId proporcionado no es válido.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Autenticación requerida. Token JWT inválido o expirado.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permisos insuficientes. No tienes permiso para asignar permisos.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol o permiso no encontrado. Verifica los IDs proporcionados.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflicto. El permiso ya está asignado a este rol.' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'update'),
    (0, common_1.Post)(':id/permissions'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_role_permission_dto_1.AssignRolePermissionDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "assignPermission", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Revocar permiso de un rol', description: 'Revoca (elimina) un permiso específico de un rol.' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID único del rol', type: Number }),
    (0, swagger_1.ApiParam)({ name: 'permissionId', description: 'ID único del permiso a revocar', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permiso revocado del rol exitosamente.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Autenticación requerida. Token JWT inválido o expirado.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Permisos insuficientes. No tienes permiso para modificar permisos.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rol o permiso no encontrado. Verifica los IDs proporcionados.' }),
    (0, require_permission_decorator_1.RequiredPermission)('roles', 'delete'),
    (0, common_1.Patch)(':id/permissions/:permissionId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('permissionId')),
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