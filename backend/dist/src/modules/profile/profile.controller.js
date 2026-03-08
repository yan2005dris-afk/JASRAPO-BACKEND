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
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const create_profile_dto_1 = require("./dto/create-profile.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const profile_service_1 = require("./profile.service");
const minio_service_1 = require("../storage/minio.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let ProfileController = class ProfileController {
    profileService;
    minioService;
    constructor(profileService, minioService) {
        this.profileService = profileService;
        this.minioService = minioService;
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
    uploadAvatar(req, file) {
        const usersId = req.user.usersId;
        return this.profileService.uploadAvatar(usersId, file);
    }
    async listAvailableAvatars(req) {
        const usersId = req.user.usersId;
        return this.profileService.listAvailableAvatars(usersId);
    }
    async selectExistingAvatar(req, key) {
        const usersId = req.user.usersId;
        return this.profileService.selectExistingAvatar(usersId, key);
    }
    async getAvatar(fileName, res) {
        const exists = await this.minioService.fileExists('avatars', fileName);
        if (!exists) {
            return res.status(404).json({
                statusCode: 404,
                message: 'Imagen no encontrada. Es posible que haya sido eliminada o modificada.',
            });
        }
        const url = await this.minioService.getPresignedUrl('avatars', fileName);
        res.redirect(url);
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
    openapi.ApiResponse({ status: 200, type: Object }),
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
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Subir foto de perfil',
        description: 'Sube una imagen a MinIO y actualiza el campo de avatar del perfil del usuario.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Foto de perfil subida exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No se envió ninguna imagen' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Perfil no encontrado' }),
    (0, common_1.Post)('avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "uploadAvatar", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Listar avatares disponibles',
        description: 'Lista las imágenes de avatar disponibles en MinIO para el usuario. ' +
            'Útil para recuperar y reutilizar imágenes previamente subidas.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de avatares disponibles',
        schema: {
            example: {
                avatars: [
                    { key: 'avatar_profile_1_1709834567890.png', url: 'http://...' },
                ],
            },
        },
    }),
    (0, common_1.Get)('avatars/available'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "listAvailableAvatars", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Seleccionar avatar existente',
        description: 'Permite seleccionar una imagen que ya existe en MinIO como avatar del usuario. ' +
            'No es necesario volver a subir el archivo.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['key'],
            properties: {
                key: {
                    type: 'string',
                    description: 'Nombre del archivo en MinIO',
                    example: 'avatar_profile_1_1709834567890.png',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avatar vinculado exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'El archivo no existe en MinIO' }),
    (0, common_1.Patch)('avatar/select'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "selectExistingAvatar", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener imagen de avatar',
        description: 'Redirige a una URL temporal de MinIO para servir la imagen del avatar. ' +
            'No requiere autenticación, ya que se usa directamente en etiquetas <img>.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'fileName',
        description: 'Nombre del archivo de avatar almacenado en MinIO',
        example: 'avatar_profile_1_1709834567890.png',
    }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirige a la URL temporal del avatar' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Avatar no encontrado' }),
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('avatar/:fileName'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('fileName')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getAvatar", null);
exports.ProfileController = ProfileController = __decorate([
    (0, swagger_1.ApiTags)('profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('profile'),
    __metadata("design:paramtypes", [profile_service_1.ProfileService,
        minio_service_1.MinioService])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map