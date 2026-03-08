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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../database/prisma.service");
const minio_service_1 = require("../storage/minio.service");
let ProfileService = class ProfileService {
    prisma;
    minioService;
    constructor(prisma, minioService) {
        this.prisma = prisma;
        this.minioService = minioService;
    }
    async create(usersId, createProfileDto) {
        const existing = await this.prisma.profiles.findUnique({
            where: { usersId },
        });
        if (existing) {
            throw new common_1.ConflictException('El usuario ya tiene un perfil creado');
        }
        const profile = await this.prisma.profiles.create({
            data: {
                usersId,
                firstName: createProfileDto.firstName,
                lastName: createProfileDto.lastName,
                phone: createProfileDto.phone,
            },
        });
        return profile;
    }
    async findMyProfile(usersId) {
        let profile = await this.prisma.profiles.findUnique({
            where: { usersId },
        });
        if (!profile) {
            profile = await this.prisma.profiles.create({
                data: { usersId },
            });
        }
        if (!profile.avatar) {
            profile = await this.tryRecoverAvatar(usersId, profile);
        }
        return profile;
    }
    async tryRecoverAvatar(usersId, profile) {
        try {
            const allFiles = await this.minioService.listFiles('avatars');
            if (!allFiles.length)
                return profile;
            const userFiles = allFiles.filter(f => f.startsWith(`avatar_profile_${usersId}_`));
            const targetFile = userFiles.length > 0
                ? userFiles[userFiles.length - 1]
                : null;
            if (!targetFile)
                return profile;
            const meta = await this.minioService.getFileMetadata('avatars', targetFile);
            const avatarMeta = {
                uuid: targetFile.split('.')[0],
                key: targetFile,
                originalName: targetFile,
                mimeType: meta?.contentType || 'image/png',
                size: meta?.size || 0,
                bucket: 'avatars',
                uploadedAt: meta?.lastModified?.toISOString() || new Date().toISOString(),
            };
            return this.prisma.profiles.update({
                where: { usersId },
                data: { avatar: avatarMeta },
            });
        }
        catch {
            return profile;
        }
    }
    async update(usersId, updateProfileDto) {
        const existing = await this.prisma.profiles.findUnique({
            where: { usersId },
        });
        if (!existing) {
            return this.prisma.profiles.create({
                data: {
                    usersId,
                    firstName: updateProfileDto.firstName,
                    lastName: updateProfileDto.lastName,
                    phone: updateProfileDto.phone,
                },
            });
        }
        return this.prisma.profiles.update({
            where: { usersId },
            data: {
                firstName: updateProfileDto.firstName,
                lastName: updateProfileDto.lastName,
                phone: updateProfileDto.phone,
            },
        });
    }
    async uploadAvatar(usersId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No se envió ninguna imagen');
        }
        let profile = await this.prisma.profiles.findUnique({
            where: { usersId },
        });
        if (!profile) {
            profile = await this.prisma.profiles.create({
                data: { usersId },
            });
        }
        const uuid = (0, crypto_1.randomUUID)();
        const fileExtension = file.originalname.split('.').pop() || 'png';
        const fileName = `${uuid}.${fileExtension}`;
        const bucketName = 'avatars';
        await this.minioService.uploadFile(bucketName, fileName, file.buffer);
        const avatarMeta = {
            uuid,
            key: fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            bucket: bucketName,
            uploadedAt: new Date().toISOString(),
        };
        await this.prisma.profiles.update({
            where: { usersId },
            data: { avatar: avatarMeta },
        });
        return {
            message: 'Foto de perfil actualizada exitosamente',
            avatar: avatarMeta,
        };
    }
    async listAvailableAvatars(usersId) {
        const allFiles = await this.minioService.listFiles('avatars');
        const userFiles = allFiles.filter(f => f.startsWith(`avatar_profile_${usersId}_`));
        const profile = await this.prisma.profiles.findUnique({
            where: { usersId },
        });
        const currentMeta = profile?.avatar;
        if (currentMeta?.key && !userFiles.includes(currentMeta.key)) {
            userFiles.push(currentMeta.key);
        }
        const avatars = await Promise.all(userFiles.map(async (key) => {
            const url = await this.minioService.getPresignedUrl('avatars', key);
            return { key, url };
        }));
        return { avatars };
    }
    async selectExistingAvatar(usersId, key) {
        if (!key) {
            throw new common_1.BadRequestException('Debe indicar el key del archivo');
        }
        const exists = await this.minioService.fileExists('avatars', key);
        if (!exists) {
            throw new common_1.NotFoundException('Imagen no encontrada en el almacenamiento. Es posible que haya sido eliminada.');
        }
        const meta = await this.minioService.getFileMetadata('avatars', key);
        const avatarMeta = {
            uuid: key.split('.')[0],
            key,
            originalName: key,
            mimeType: meta?.contentType || 'image/png',
            size: meta?.size || 0,
            bucket: 'avatars',
            uploadedAt: meta?.lastModified?.toISOString() || new Date().toISOString(),
        };
        let profile = await this.prisma.profiles.findUnique({
            where: { usersId },
        });
        if (!profile) {
            profile = await this.prisma.profiles.create({
                data: { usersId, avatar: avatarMeta },
            });
        }
        else {
            profile = await this.prisma.profiles.update({
                where: { usersId },
                data: { avatar: avatarMeta },
            });
        }
        return {
            message: 'Avatar vinculado exitosamente',
            avatar: avatarMeta,
        };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        minio_service_1.MinioService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map