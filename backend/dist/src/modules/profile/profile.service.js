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
const prisma_service_1 = require("../../database/prisma.service");
let ProfileService = class ProfileService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
                avatar: createProfileDto.avatar,
            },
        });
        return profile;
    }
    async findMyProfile(usersId) {
        const profile = await this.prisma.profiles.findUnique({
            where: { usersId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('El usuario aún no tiene un perfil');
        }
        return profile;
    }
    async update(usersId, updateProfileDto) {
        const existing = await this.prisma.profiles.findUnique({
            where: { usersId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('No se encontró un perfil para este usuario. Crea uno primero.');
        }
        const updated = await this.prisma.profiles.update({
            where: { usersId },
            data: {
                firstName: updateProfileDto.firstName,
                lastName: updateProfileDto.lastName,
                phone: updateProfileDto.phone,
                avatar: updateProfileDto.avatar,
            },
        });
        return updated;
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map