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
exports.PermissionsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const permissions_service_1 = require("./permissions.service");
const create_permission_dto_1 = require("./dto/create-permission.dto");
const update_permission_dto_1 = require("./dto/update-permission.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const require_permission_decorator_1 = require("../../common/decorators/require-permission.decorator");
const swagger_1 = require("@nestjs/swagger");
let PermissionsController = class PermissionsController {
    permissionsService;
    constructor(permissionsService) {
        this.permissionsService = permissionsService;
    }
    create(createPermissionDto) {
        return this.permissionsService.create(createPermissionDto);
    }
    findAll() {
        return this.permissionsService.findAll();
    }
    findOne(id) {
        return this.permissionsService.findOne(+id);
    }
    update(id, updatePermissionDto) {
        return this.permissionsService.update(+id, updatePermissionDto);
    }
    SoftDelete(id) {
        return this.permissionsService.remove(+id);
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Crear permiso',
        description: 'Crea un nuevo permiso en el sistema (ej: users:read, users:create).',
    }),
    (0, swagger_1.ApiBody)({
        type: create_permission_dto_1.CreatePermissionDto,
        description: 'Datos del permiso a crear (resource y action)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Permiso creado exitosamente',
        schema: {
            example: {
                permissionsId: 1,
                resource: 'users',
                action: 'read',
                createdAt: '2024-01-15T10:30:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso permissions:create' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflicto - El permiso ya existe' }),
    (0, require_permission_decorator_1.RequiredPermission)('permissions', 'create'),
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_permission_dto_1.CreatePermissionDto]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Listar permisos',
        description: 'Retorna todos los permisos registrados en el sistema.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de permisos obtenida exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso permissions:read' }),
    (0, require_permission_decorator_1.RequiredPermission)('permissions', 'read'),
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener permiso por ID',
        description: 'Retorna los datos de un permiso específico.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del permiso',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permiso encontrado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso permissions:read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Permiso no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('permissions', 'read'),
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar permiso',
        description: 'Actualiza el resource o action de un permiso existente.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del permiso a actualizar',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiBody)({
        type: update_permission_dto_1.UpdatePermissionDto,
        description: 'Datos a actualizar (resource y/o action)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permiso actualizado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso permissions:update' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Permiso no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('permissions', 'update'),
    (0, common_1.Patch)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_permission_dto_1.UpdatePermissionDto]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar permiso',
        description: 'Marca un permiso como eliminado (soft delete).',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID único del permiso a eliminar',
        type: Number,
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permiso eliminado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Prohibido - Sin permiso permissions:delete' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Permiso no encontrado' }),
    (0, require_permission_decorator_1.RequiredPermission)('permissions', 'delete'),
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "SoftDelete", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, swagger_1.ApiTags)('permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('permissions'),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map