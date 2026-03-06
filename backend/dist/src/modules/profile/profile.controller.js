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
exports.ProfileController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const create_profile_dto_1 = require("./dto/create-profile.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const profile_service_1 = require("./profile.service");
let ProfileController = class ProfileController {
    profileService;
    constructor(profileService) {
        this.profileService = profileService;
    }
    create(req, createProfileDto) {
        const usersId = req.user.usersId;
        return this.profileService.create(usersId, createProfileDto);
    }
    findMe(req) {
        const usersId = req.user.usersId;
        return this.profileService.findMyProfile(usersId);
    }
    update(req, updateProfileDto) {
        const usersId = req.user.usersId;
        return this.profileService.update(usersId, updateProfileDto);
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Crear perfil del usuario autenticado',
        description: 'Crea el perfil para el usuario actualmente autenticado. Solo se permite crear un perfil por usuario.',
    }),
    (0, swagger_1.ApiBody)({
        type: create_profile_dto_1.CreateProfileDto,
        description: 'Datos del perfil a crear',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Perfil creado exitosamente',
        schema: {
            example: {
                profileId: 1,
                usersId: 1,
                name: 'Juan Pérez',
                phone: '+593999999999',
                address: 'Quito, Ecuador',
                createdAt: '2024-01-15T10:30:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflicto - El usuario ya tiene un perfil creado',
    }),
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_profile_dto_1.CreateProfileDto]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener mi perfil',
        description: 'Retorna el perfil del usuario actualmente autenticado.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Perfil obtenido exitosamente',
        schema: {
            example: {
                profileId: 1,
                usersId: 1,
                name: 'Juan Pérez',
                phone: '+593999999999',
                address: 'Quito, Ecuador',
                createdAt: '2024-01-15T10:30:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Perfil no encontrado' }),
    (0, common_1.Get)('me'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "findMe", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar mi perfil',
        description: 'Actualiza los datos del perfil del usuario actualmente autenticado.',
    }),
    (0, swagger_1.ApiBody)({
        type: update_profile_dto_1.UpdateProfileDto,
        description: 'Datos a actualizar en el perfil',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Perfil actualizado exitosamente',
        schema: {
            example: {
                profileId: 1,
                usersId: 1,
                name: 'Juan Pérez Actualizado',
                phone: '+593988888888',
                address: 'Guayaquil, Ecuador',
                updatedAt: '2024-01-15T12:00:00Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Perfil no encontrado' }),
    (0, common_1.Patch)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "update", null);
exports.ProfileController = ProfileController = __decorate([
    (0, swagger_1.ApiTags)('profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('profile'),
    __metadata("design:paramtypes", [profile_service_1.ProfileService])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map